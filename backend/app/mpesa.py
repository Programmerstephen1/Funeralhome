import os
import base64
import datetime
import requests
import urllib.parse # NEW: Used to safely attach the email to the URL
from requests.auth import HTTPBasicAuth

def get_mpesa_access_token():
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    
    # 🔴 PRODUCTION CHANGE 1: The Authentication URL
    # When you go live, change "sandbox.safaricom.co.ke" to "api.safaricom.co.ke"
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

# NEW: Added 'email' as an optional parameter
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
    base_callback_url = os.getenv("MPESA_CALLBACK_URL", "https://your-live-domain.com/api/payments/callback")
    
    # NEW: If an email is provided, attach it securely to the callback URL!
    if email:
        callback_url = f"{base_callback_url}?email={urllib.parse.quote(email)}"
    else:
        callback_url = base_callback_url

    # 🔴 PRODUCTION CHANGE 2: The STK Push URL
    # When you go live, change "sandbox.safaricom.co.ke" to "api.safaricom.co.ke"
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

    # 🔴 PRODUCTION CHANGE 3: The Transaction Type
    # If Safaricom gives you a "Paybill" number, keep this as "CustomerPayBillOnline"
    # If Safaricom gives you a "Till" number (Buy Goods), change this to "CustomerBuyGoodsOnline"
    payload = {
        "BusinessShortCode": business_short_code,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline", 
        "Amount": int(amount),
        "PartyA": phone_str,
        "PartyB": business_short_code,
        "PhoneNumber": phone_str,
        "CallBackURL": callback_url, # Now includes the email!
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