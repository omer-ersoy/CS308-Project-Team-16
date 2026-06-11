"""Add cancelled order status"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260611_0009"
down_revision: Union[str, Sequence[str], None] = "20260611_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_constraint("ck_orders_status", type_="check")
        batch_op.create_check_constraint(
            "ck_orders_status",
            "status IN ('processing', 'in-transit', 'delivered', 'cancelled')",
        )


def downgrade() -> None:
    op.execute("UPDATE orders SET status = 'processing' WHERE status = 'cancelled'")
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_constraint("ck_orders_status", type_="check")
        batch_op.create_check_constraint(
            "ck_orders_status",
            "status IN ('processing', 'in-transit', 'delivered')",
        )
