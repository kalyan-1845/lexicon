# backend/app/tests/conftest.py
"""
Pytest configuration for the upload test suite.

Pins anyio to asyncio only — trio is not installed in this environment.
The `anyio_backend` fixture is the canonical way to restrict the backend
(see anyio docs: https://anyio.readthedocs.io/en/stable/testing.html).
"""
import pytest

pytest_plugins = ("anyio",)


@pytest.fixture(params=["asyncio"])
def anyio_backend(request):
    """Run all @pytest.mark.anyio tests on asyncio only."""
    return request.param
