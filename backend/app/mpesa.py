import os
import base64
import datetime
import requests
import urllib.parse 
from requests.auth import HTTPBasicAuth

def get_mpesa_access_token():
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    
    api_url = os.getenv(
        "MPESA_OAUTH_URL", 
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    )

    try:
        r = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
        r.raise_for_status()
        return r.json().get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"Failed to get M-Pesa access token: {e}")
        return None

def generate_stk_push_payload(amount, phone, email=None):
    phone_str = str(phone).strip()
    if phone_str.startswith("0"):
        phone_str = "254" + phone_str[1:]
    elif phone_str.startswith("+"):
        phone_str = phone_str[1:]
        
    access_token = get_mpesa_access_token()
    if not access_token:
        return {"error": "Failed to authenticate with Safaricom Daraja API."}

    business_short_code = os.getenv("MPESA_SHORTCODE", "174379") 
    passkey = os.getenv("MPESA_PASSKEY")
    
    # 🔴 PRO-GRADE FIX: Replace YOUR_PYTHON_BACKEND_URL_HERE with your live backend address
    # Example: "https://funeral-home-backend-xyz.onrender.com/api/payments/callback"
    base_callback_url = os.getenv("MPESA_CALLBACK_URL", "https://YOUR_PYTHON_BACKEND_URL_HERE/api/payments/callback")
    
    if email:
        callback_url = f"{base_callback_url}?email={urllib.parse.quote(email)}"
    else:
        callback_url = base_callback_url

    stk_push_url = os.getenv(
        "MPESA_STK_PUSH_URL", 
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    )

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
        "AccountReference": "Hollow Pine",
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
        print(f"STK Push Request Failed: {e}")
        if e.response is not None:
            print(f"Safaricom Error Details: {e.response.text}")
        return {"error": "Failed to initiate M-Pesa payment. Please try again."}