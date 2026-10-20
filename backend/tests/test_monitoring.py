import os
import sys
import unittest


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import scrub_sentry_event  # noqa: E402


class SentryPrivacyFilterTests(unittest.TestCase):
    def test_scrubs_identifying_and_request_content_fields(self):
        event = {
            "user": {"email": "private@example.test", "ip_address": "192.0.2.1"},
            "extra": {"memorial_pin": "1234"},
            "message": "sensitive user supplied text",
            "request": {
                "url": "https://service.example.test/api/memorial/private-slug?pin=1234",
                "data": {"security_answer": "secret"},
                "headers": {"Authorization": "Bearer token"},
                "cookies": "session-cookie",
                "query_string": "pin=1234",
            },
            "exception": {"values": [{"type": "ValueError", "value": "contains private data"}]},
        }

        scrubbed = scrub_sentry_event(event)

        self.assertNotIn("user", scrubbed)
        self.assertNotIn("extra", scrubbed)
        self.assertNotIn("message", scrubbed)
        self.assertEqual(scrubbed["request"], {"url": "https://service.example.test/[redacted]"})
        self.assertEqual(scrubbed["exception"]["values"][0]["value"], "ValueError")


if __name__ == "__main__":
    unittest.main()
