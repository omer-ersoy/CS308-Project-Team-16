"""Expand delivery list entries with required delivery fields"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260610_0007"
down_revision: Union[str, Sequence[str], None] = "20260610_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "delivery_list_entries_v2",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("total_price", sa.DECIMAL(10, 2), nullable=False),
        sa.Column("delivery_address", sa.Text(), nullable=False),
        sa.Column(
            "completion_status",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
    )
    op.execute(
        """
        INSERT INTO delivery_list_entries_v2 (
            order_id,
            customer_id,
            product_id,
            quantity,
            total_price,
            delivery_address,
            completion_status,
            created_at
        )
        SELECT
            deliveries.order_id,
            deliveries.user_id,
            items.product_id,
            items.quantity,
            items.unit_price * items.quantity,
            'Address pending',
            CASE WHEN orders.status = 'delivered' THEN true ELSE false END,
            deliveries.created_at
        FROM delivery_list_entries AS deliveries
        JOIN orders ON orders.id = deliveries.order_id
        JOIN order_items AS items ON items.order_id = deliveries.order_id
        """
    )
    op.drop_table("delivery_list_entries")
    op.rename_table("delivery_list_entries_v2", "delivery_list_entries")
    op.create_index(
        "ix_delivery_list_entries_order_id",
        "delivery_list_entries",
        ["order_id"],
    )
    op.create_index(
        "ix_delivery_list_entries_customer_id",
        "delivery_list_entries",
        ["customer_id"],
    )
    op.create_index(
        "ix_delivery_list_entries_product_id",
        "delivery_list_entries",
        ["product_id"],
    )


def downgrade() -> None:
    op.create_table(
        "delivery_list_entries_v1",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("order_id"),
    )
    op.execute(
        """
        INSERT INTO delivery_list_entries_v1 (order_id, user_id, created_at)
        SELECT order_id, customer_id, MIN(created_at)
        FROM delivery_list_entries
        GROUP BY order_id, customer_id
        """
    )
    op.drop_table("delivery_list_entries")
    op.rename_table("delivery_list_entries_v1", "delivery_list_entries")
    op.create_index(
        "ix_delivery_list_entries_order_id",
        "delivery_list_entries",
        ["order_id"],
    )
    op.create_index(
        "ix_delivery_list_entries_user_id",
        "delivery_list_entries",
        ["user_id"],
    )
