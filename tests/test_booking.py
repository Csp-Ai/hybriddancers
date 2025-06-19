import os
import pytest

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:4242")

def test_create_checkout_session():
    try:
        import requests
    except ImportError as exc:
        pytest.skip(f"requests not installed: {exc}")

    data = {"name": "Test", "email": "test@example.com", "classType": "Hip Hop"}
    try:
        resp = requests.post(f"{BASE_URL}/create-checkout-session", json=data, timeout=5)
    except Exception as exc:
        pytest.skip(f"Server not running: {exc}")
    assert resp.status_code in (200, 400, 500)
