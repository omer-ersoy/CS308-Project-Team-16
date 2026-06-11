export function normalizeCardNumber(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidLuhn(value) {
  const digits = normalizeCardNumber(value);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isValidExpiry(value, now = new Date()) {
  const match = String(value ?? "").trim().match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }

  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return expiryEnd >= now;
}

export function validateMockPayment({ cardName, cardNumber, expiry, cvv }, now = new Date()) {
  if (String(cardName ?? "").trim().length < 2) {
    return "Enter the cardholder name.";
  }
  if (!isValidLuhn(cardNumber)) {
    return "Enter a valid card number.";
  }
  if (!isValidExpiry(expiry, now)) {
    return "Enter a valid expiry date.";
  }
  if (!/^\d{3,4}$/.test(String(cvv ?? "").trim())) {
    return "Enter a valid CVV.";
  }
  return "";
}
