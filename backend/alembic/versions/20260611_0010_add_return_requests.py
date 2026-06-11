"""Add return requests"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260611_0010"
down_revision: Union[str, Sequence[str], None] = "20260611_0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "return_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("order_item_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="pending", nullable=False),
        sa.Column("refund_amount", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("decision_note", sa.Text(), nullable=True),
        sa.Column("evaluated_by_id", sa.Integer(), nullable=True),
        sa.Column("evaluated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_return_requests_quantity_positive"),
        sa.CheckConstraint("status IN ('pending', 'approved', 'rejected')", name="ck_return_requests_status"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["order_item_id"], ["order_items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["evaluated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("order_item_id", name="uq_return_requests_order_item"),
    )
    op.create_index("ix_return_requests_order_id", "return_requests", ["order_id"])
    op.create_index("ix_return_requests_order_item_id", "return_requests", ["order_item_id"])
    op.create_index("ix_return_requests_customer_id", "return_requests", ["customer_id"])
    op.create_index("ix_return_requests_product_id", "return_requests", ["product_id"])
    op.create_index("ix_return_requests_evaluated_by_id", "return_requests", ["evaluated_by_id"])


def downgrade() -> None:
    op.drop_index("ix_return_requests_evaluated_by_id", table_name="return_requests")
    op.drop_index("ix_return_requests_product_id", table_name="return_requests")
    op.drop_index("ix_return_requests_customer_id", table_name="return_requests")
    op.drop_index("ix_return_requests_order_item_id", table_name="return_requests")
    op.drop_index("ix_return_requests_order_id", table_name="return_requests")
    op.drop_table("return_requests")
