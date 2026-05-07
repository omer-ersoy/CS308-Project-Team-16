from fastapi.testclient import TestClient

from tests.conftest import auth_headers


def test_checkout_requires_authentication(client: TestClient, sample_data: dict[str, object]) -> None:
    product = sample_data["product"]
    cart_id = 1

    add_response = client.post(
        f"/api/carts/{cart_id}/items",
        json={"product_id": product.id, "quantity": 1},
    )
    assert add_response.status_code == 200

    response = client.post(f"/api/carts/{cart_id}/checkout")

    assert response.status_code == 401


def test_authenticated_checkout_creates_order_for_logged_in_user(
    client: TestClient,
    sample_data: dict[str, object],
) -> None:
    product = sample_data["product"]
    customer = sample_data["customer"]
    cart_id = 1

    add_response = client.post(
        f"/api/carts/{cart_id}/items",
        json={"product_id": product.id, "quantity": 1},
    )
    assert add_response.status_code == 200

    response = client.post(f"/api/carts/{cart_id}/checkout", headers=auth_headers(customer))

    assert response.status_code == 200
    invoice = response.json()
    assert invoice["item_count"] == 1
    assert invoice["items"][0]["product_id"] == product.id
