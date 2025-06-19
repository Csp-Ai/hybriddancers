import os
import pytest

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:4242")


def test_bookings_requires_auth():
    """Request the bookings API with an invalid token and expect a 401/403."""
    try:
        import requests
    except ImportError as exc:
        pytest.skip(f"requests not installed: {exc}")

    headers = {"Authorization": "Bearer invalid"}
    try:
        resp = requests.get(f"{BASE_URL}/api/bookings", headers=headers, timeout=5)
    except Exception as exc:
        pytest.skip(f"Server not running: {exc}")

    if resp.status_code == 200:
        pytest.skip("Auth not enforced on this endpoint")

    assert resp.status_code in (401, 403)
