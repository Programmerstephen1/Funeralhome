"""Regression coverage for authenticated and idempotent M-Pesa callbacks."""
import os
import sys
import unittest
from decimal import Decimal


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault("DATABASE_URL", "sqlite://")

from app import create_app, db, limiter  # noqa: E402
from app.models import MpesaCallbackEvent, PaymentTransaction  # noqa: E402


class MpesaCallbackIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config.update(
            TESTING=True,
            MPESA_CALLBACK_TOKEN="test-callback-token-not-for-production",
        )

    def setUp(self):
        with self.app.app_context():
            db.drop_all()
            db.create_all()
        limiter.reset()
        self.client = self.app.test_client()

    def add_transaction(self, checkout_id="ws_CO_123", amount="250.00", status="initiated"):
        with self.app.app_context():
            transaction = PaymentTransaction(
                checkout_request_id=checkout_id,
                amount=Decimal(amount),
                status=status,
                email="family@example.test",
            )
            db.session.add(transaction)
            db.session.commit()
            return transaction.id

    def callback(self, checkout_id="ws_CO_123", amount=250, receipt="QAB123XYZ"):
        metadata = []
        if amount is not None:
            metadata.append({"Name": "Amount", "Value": amount})
        if receipt is not None:
            metadata.append({"Name": "MpesaReceiptNumber", "Value": receipt})
        return {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": checkout_id,
                    "ResultCode": 0,
                    "CallbackMetadata": {"Item": metadata},
                }
            }
        }

    def post_callback(self, payload, token="test-callback-token-not-for-production"):
        return self.client.post(f"/api/payments/callback?token={token}", json=payload)

    def get_transaction(self, checkout_id="ws_CO_123"):
        with self.app.app_context():
            return PaymentTransaction.query.filter_by(checkout_request_id=checkout_id).one()

    def test_rejects_missing_or_incorrect_callback_token(self):
        payload = self.callback()
        self.assertEqual(self.post_callback(payload, token="wrong").status_code, 403)
        self.assertEqual(self.client.post("/api/payments/callback", json=payload).status_code, 403)
        with self.app.app_context():
            self.assertEqual(MpesaCallbackEvent.query.count(), 0)

    def test_successful_callback_reconciles_once_and_duplicate_is_acknowledged(self):
        transaction_id = self.add_transaction()
        payload = self.callback()

        first = self.post_callback(payload)
        duplicate = self.post_callback(payload)

        self.assertEqual(first.status_code, 200, first.get_json())
        self.assertEqual(duplicate.status_code, 200, duplicate.get_json())
        transaction = self.get_transaction()
        self.assertEqual(transaction.id, transaction_id)
        self.assertEqual(transaction.status, "completed")
        self.assertEqual(transaction.mpesa_receipt, "QAB123XYZ")
        self.assertIsNotNone(transaction.callback_received_at)
        with self.app.app_context():
            self.assertEqual(MpesaCallbackEvent.query.count(), 1)

    def test_amount_mismatch_is_never_marked_paid(self):
        self.add_transaction()

        response = self.post_callback(self.callback(amount=200))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.get_transaction().status, "reconciliation_required")
        with self.app.app_context():
            event = MpesaCallbackEvent.query.one()
            self.assertEqual(event.error, "amount_or_receipt_reconciliation_failed")

    def test_receipt_cannot_be_reused_for_a_different_checkout(self):
        self.add_transaction("ws_CO_first")
        self.add_transaction("ws_CO_second")
        first = self.post_callback(self.callback("ws_CO_first", receipt="QAB123XYZ"))
        second = self.post_callback(self.callback("ws_CO_second", receipt="QAB123XYZ"))

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(self.get_transaction("ws_CO_first").status, "completed")
        self.assertEqual(self.get_transaction("ws_CO_second").status, "reconciliation_required")

    def test_conflicting_replay_does_not_overwrite_original_transaction_result(self):
        self.add_transaction()
        self.post_callback(self.callback())

        conflict = self.post_callback(self.callback(amount=999, receipt="OTHERRECEIPT"))

        self.assertEqual(conflict.status_code, 200)
        self.assertEqual(self.get_transaction().status, "completed")
        self.assertEqual(self.get_transaction().mpesa_receipt, "QAB123XYZ")
        with self.app.app_context():
            self.assertEqual(MpesaCallbackEvent.query.count(), 1)


if __name__ == "__main__":
    unittest.main()
