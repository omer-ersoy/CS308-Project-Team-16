from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models import User
from tests.conftest import auth_headers


def test_public_review_list_only_returns_approved_reviews(client: TestClient, sample_data: dict[str, object]) -> None:
    product = sample_data["product"]

    response = client.get(f"/api/products/{product.id}/reviews")

    assert response.status_code == 200
    reviews = response.json()
    assert [review["status"] for review in reviews] == ["approved"]
    assert reviews[0]["user_full_name"] == "Other Customer"


def test_review_author_can_see_their_pending_review(client: TestClient, sample_data: dict[str, object]) -> None:
    product = sample_data["product"]
    customer = sample_data["customer"]

    response = client.get(f"/api/products/{product.id}/reviews", headers=auth_headers(customer))

    assert response.status_code == 200
    statuses = {review["status"] for review in response.json()}
    assert statuses == {"approved", "pending"}


def test_customer_can_create_one_review_per_product(client: TestClient, sample_data: dict[str, object]) -> None:
    product = sample_data["product"]
    customer = sample_data["customer"]

    response = client.post(
        f"/api/products/{product.id}/reviews",
        headers=auth_headers(customer),
        json={"rating": 5, "comment": "I changed my mind."},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "You have already reviewed this product"


def test_review_update_resets_status_to_pending(
    client: TestClient,
    db_session: Session,
    sample_data: dict[str, object],
) -> None:
    product = sample_data["product"]
    review = sample_data["approved_review"]
    author = sample_data["other_customer"]

    response = client.patch(
        f"/api/products/{product.id}/reviews/{review.id}",
        headers=auth_headers(author),
        json={"rating": 4, "comment": "Still good after another try."},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "pending"
    db_session.refresh(review)
    assert review.status == "pending"
    assert review.comment == "Still good after another try."


def test_non_author_cannot_update_review(client: TestClient, sample_data: dict[str, object]) -> None:
    product = sample_data["product"]
    review = sample_data["approved_review"]
    customer = sample_data["customer"]

    response = client.patch(
        f"/api/products/{product.id}/reviews/{review.id}",
        headers=auth_headers(customer),
        json={"rating": 1},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Review can only be edited by its author"


def test_admin_can_moderate_review(client: TestClient, sample_data: dict[str, object]) -> None:
    admin = sample_data["admin"]
    pending_review = sample_data["pending_review"]

    response = client.patch(
        f"/api/admin/reviews/{pending_review.id}",
        headers=auth_headers(admin),
        json={"status": "approved"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"


def test_customer_cannot_access_admin_reviews(client: TestClient, sample_data: dict[str, object]) -> None:
    customer = sample_data["customer"]

    response = client.get("/api/admin/reviews", headers=auth_headers(customer))

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_last_admin_cannot_be_demoted(client: TestClient, db_session: Session, sample_data: dict[str, object]) -> None:
    admin = sample_data["admin"]

    response = client.patch(
        f"/api/admin/users/{admin.id}",
        headers=auth_headers(admin),
        json={"role": "customer"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "At least one admin account must remain"
    assert db_session.get(User, admin.id).role == "admin"
