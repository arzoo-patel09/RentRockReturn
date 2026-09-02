
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import razorpay
import os


# Load .env file
BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")


# FastAPI app
app = FastAPI(
    title="Rent Rock Return API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Razorpay credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")

RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError(
        "Razorpay API keys are missing. Check your .env file."
    )


# Razorpay client
client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


# Payment order request
class PaymentRequest(BaseModel):
    amount: int


# Payment verification request
class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


# Test route
@app.get("/")
def home():

    return {
        "message": "Rent Rock Return API is running 🚀"
    }


# Create Razorpay Order
@app.post("/create-order")
def create_order(payment: PaymentRequest):

    if payment.amount <= 0:

        raise HTTPException(
            status_code=400,
            detail="Invalid payment amount."
        )


    amount_in_paise = payment.amount * 100


    try:

        order = client.order.create({

            "amount": amount_in_paise,

            "currency": "INR",

            "payment_capture": 1

        })


        return {

            "success": True,

            "order_id": order["id"],

            "amount": payment.amount,

            "currency": "INR",

            "key_id": RAZORPAY_KEY_ID

        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# Verify Razorpay Payment
@app.post("/verify-payment")
def verify_payment(
    payment: PaymentVerificationRequest
):

    try:

        client.utility.verify_payment_signature({

            "razorpay_order_id":
                payment.razorpay_order_id,

            "razorpay_payment_id":
                payment.razorpay_payment_id,

            "razorpay_signature":
                payment.razorpay_signature

        })


        return {

            "success": True,

            "message":
                "Payment verified successfully.",

            "payment_id":
                payment.razorpay_payment_id,

            "order_id":
                payment.razorpay_order_id

        }


    except razorpay.errors.SignatureVerificationError:

        raise HTTPException(

            status_code=400,

            detail="Payment verification failed."

        )


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )
