"""Add product cost_price and order item unit_cost"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260611_0008"
down_revision: Union[str, Sequence[str], None] = "20260610_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "cost_price",
            sa.DECIMAL(10, 2),
            server_default="0",
            nullable=False,
        ),
    )
    op.add_column(
        "order_items",
        sa.Column(
            "unit_cost",
            sa.DECIMAL(10, 2),
            server_default="0",
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("order_items", "unit_cost")
    op.drop_column("products", "cost_price")
