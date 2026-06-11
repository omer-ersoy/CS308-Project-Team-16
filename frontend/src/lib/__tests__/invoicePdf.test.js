import { describe, expect, it } from "vitest";
import { orderToInvoice } from "../invoicePdf";

describe("orderToInvoice", () => {
  it("maps order records into invoice-compatible payloads", () => {
    const invoice = orderToInvoice(
      {
        id: 42,
        status: "delivered",
        created_at: "2026-06-01T10:00:00Z",
        total_amount: "199.98",
        items: [
          {
            product_id: 3,
            product_name: "Bleu de Chanel",
            quantity: 2,
            unit_price: "99.99",
          },
        ],
      },
      {
        full_name: "Demo Customer",
        email: "customer@example.com",
      },
    );

    expect(invoice.order_id).toBe("ORD-42");
    expect(invoice.db_order_id).toBe(42);
    expect(invoice.customer_name).toBe("Demo Customer");
    expect(invoice.customer_email).toBe("customer@example.com");
    expect(invoice.item_count).toBe(2);
    expect(invoice.items[0].line_total).toBe(199.98);
  });
});
