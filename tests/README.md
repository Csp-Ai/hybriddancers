# Tests

This folder contains automated tests for the Hybrid Dancers project.

- `test_html.py` checks the basic HTML structure of `index.html`.
- `test_booking.py` sends a sample request to the booking endpoint. It will skip if the Node server is not running locally.
- `test_auth.py` exercises the booking API with an invalid token and asserts
  that unauthorized requests are rejected when authentication is enforced.

Run all tests with:

```bash
pytest
```
