from fastapi.testclient import TestClient

from tests.conftest import auth_headers


def test_register_rejects_weak_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Weak Password",
            "email": "weak@example.com",
            "tax_id": "33333333330",
            "address": "Weak Password Test Address",
            "password": "password",
        },
    )

    assert response.status_code == 422


def test_login_rejects_unexpected_fields(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={
            "email": "customer@example.com",
            "password": "password123",
            "role": "admin",
        },
    )

    assert response.status_code == 422


def test_cart_rejects_invalid_cart_id(client: TestClient) -> None:
    response = client.get("/api/carts/0")

    assert response.status_code == 400
    assert response.json()["detail"] == "Cart id must be greater than zero."


def test_cart_rejects_invalid_item_payload(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    product = sample_data["product"]

    response = client.post(
        "/api/carts/1/items",
        json={"product_id": product.id, "quantity": 0},
    )

    assert response.status_code == 422


def test_checkout_rechecks_current_stock_before_creating_order(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    customer = sample_data["customer"]
    product = sample_data["product"]
    product.quantity_in_stock = 2

    add_response = client.post(
        "/api/carts/1/items",
        json={"product_id": product.id, "quantity": 2},
    )
    assert add_response.status_code == 200

    product.quantity_in_stock = 1
    checkout_response = client.post("/api/carts/1/checkout", headers=auth_headers(customer))

    assert checkout_response.status_code == 400
    assert checkout_response.json()["detail"] == f"Insufficient stock for product #{product.id}."
