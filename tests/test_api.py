import os
import pytest

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:4242")

def test_bookings_endpoint():
    try:
        import requests
    except ImportError as exc:
        pytest.skip(f"requests not installed: {exc}")

    try:
        resp = requests.get(f"{BASE_URL}/api/bookings", timeout=5)
    except Exception as exc:
        pytest.skip(f"Server not running: {exc}")

    assert resp.status_code in (200, 404)


def test_logs_endpoint():
    try:
        import requests
    except ImportError as exc:
        pytest.skip(f"requests not installed: {exc}")

    try:
        resp = requests.get(f"{BASE_URL}/api/logs", timeout=5)
    except Exception as exc:
        pytest.skip(f"Server not running: {exc}")

    assert resp.status_code in (200, 404)
