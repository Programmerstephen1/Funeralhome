import os
import base64
import datetime
import requests
import urllib.parse 
from requests.auth import HTTPBasicAuth
import logging

logger = logging.getLogger(__name__)

def get_mpesa_access_token():
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    
    if not consumer_key or not consumer_secret:
        error = "Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET environment variable."
        logger.error(error)
        return {"token": None, "error": error}

    api_url = os.getenv(
        "MPESA_OAUTH_URL", 
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    ).strip()

    try:
        r = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret), timeout=15)
        r.raise_for_status()
        token = r.json().get("access_token")
        if not token:
            error = "M-Pesa OAuth succeeded but no access token was returned."
            logger.error(error)
            return {"token": None, "error": error}

        logger.debug("M-Pesa OAuth token fetched successfully (masked).")
        return {"token": token, "error": None}
    except requests.exceptions.RequestException as e:
        error = f"Failed to get M-Pesa access token: {e}"
        logger.error(error)
        detail = None
        if hasattr(e, 'response') and e.response is not None:
            try:
                detail_json = e.response.json()
                detail = detail_json.get("errorMessage") or detail_json.get("error") or str(detail_json)
            except ValueError:
                detail = e.response.text
            logger.error(f"M-Pesa OAuth response: {e.response.status_code} {detail}")
        return {"token": None, "error": error, "detail": detail}


def generate_stk_push_payload(amount, phone, email=None):
    phone_str = str(phone).strip()
    if phone_str.startswith("0"):
        phone_str = "254" + phone_str[1:]
    elif phone_str.startswith("+"):
        phone_str = phone_str[1:]
    elif phone_str.isdigit() and len(phone_str) == 9:
        phone_str = "254" + phone_str

    auth_result = get_mpesa_access_token()
    access_token = auth_result.get("token")
    if not access_token:
        error_response = {"error": "Failed to authenticate with Safaricom Daraja API."}
        if auth_result.get("detail"):
            error_response["detail"] = auth_result["detail"]
        else:
            error_response["detail"] = auth_result.get("error")
        return error_response

    business_short_code = os.getenv("MPESA_SHORTCODE", "174379").strip()
    passkey = os.getenv("MPESA_PASSKEY")
    if not passkey:
        error = "Missing MPESA_PASSKEY environment variable."
        logger.error(error)
        return {"error": error, "detail": error}

    # 🔴 PRO-GRADE FIX: Strip stray whitespace/newlines from callback URL
    base_callback_url = os.getenv(
        "MPESA_CALLBACK_URL",
        "https://startup-simulator-v2.onrender.com/api/payments/callback"
    )
    base_callback_url = base_callback_url.strip()

    if email:
        callback_url = f"{base_callback_url}?email={urllib.parse.quote(email)}"
    else:
        callback_url = base_callback_url

    stk_push_url = os.getenv(
        "MPESA_STK_PUSH_URL", 
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    ).strip()

    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    password_str = business_short_code + passkey + timestamp
    password = base64.b64encode(password_str.encode("utf-8")).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": business_short_code,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline", 
        "Amount": int(amount),
        "PartyA": phone_str,
        "PartyB": business_short_code,
        "PhoneNumber": phone_str,
        "CallBackURL": callback_url,
        "AccountReference": "LastPlannerJulz",
        "TransactionDesc": "Funeral Services Payment"
    }

    try:
        response = requests.post(stk_push_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        return {
            "status": "success",
            "checkout_request_id": data.get("CheckoutRequestID"),
            "merchant_request_id": data.get("MerchantRequestID"),
            "message": data.get("CustomerMessage", "STK Push sent to customer's phone.")
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"STK Push Request Failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Safaricom Error Details: {e.response.status_code} {e.response.text}")
        return {"error": "Failed to initiate M-Pesa payment. Please try again."}