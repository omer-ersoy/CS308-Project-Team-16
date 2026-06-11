import { describe, expect, it } from "vitest";
import { isValidExpiry, isValidLuhn, normalizeCardNumber, validateMockPayment } from "../paymentValidation";

describe("payment validation", () => {
  it("normalizes card numbers to digits", () => {
    expect(normalizeCardNumber("4111 1111-1111 1111")).toBe("4111111111111111");
  });

  it("validates card numbers with Luhn", () => {
    expect(isValidLuhn("4111 1111 1111 1111")).toBe(true);
    expect(isValidLuhn("4111 1111 1111 1112")).toBe(false);
  });

  it("rejects expired or malformed expiry dates", () => {
    const now = new Date(2026, 5, 11);

    expect(isValidExpiry("06/26", now)).toBe(true);
    expect(isValidExpiry("05/26", now)).toBe(false);
    expect(isValidExpiry("13/26", now)).toBe(false);
  });

  it("returns a validation message for invalid payment inputs", () => {
    expect(
      validateMockPayment(
        {
          cardName: "A",
          cardNumber: "4111111111111111",
          expiry: "12/30",
          cvv: "123",
        },
        new Date(2026, 5, 11),
      ),
    ).toBe("Enter the cardholder name.");
  });

  it("accepts a valid mock payment payload", () => {
    expect(
      validateMockPayment(
        {
          cardName: "Ada Lovelace",
          cardNumber: "4111111111111111",
          expiry: "12/30",
          cvv: "123",
        },
        new Date(2026, 5, 11),
      ),
    ).toBe("");
  });
});
