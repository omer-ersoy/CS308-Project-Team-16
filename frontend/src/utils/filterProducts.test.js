import test from "node:test";
import assert from "node:assert/strict";
import { filterProducts } from "./filterProducts.js";

const sampleProducts = [
  {
    id: "bleu-de-chanel",
    name: "Bleu de Chanel",
    volume: "100 ml",
    shortDescription: "A woody and spicy fragrance.",
    details: "Elegant and long-lasting scent.",
    features: ["Woody", "Spicy"],
  },
  {
    id: "sauvage",
    name: "Sauvage",
    volume: "100 ml",
    shortDescription: "Fresh bergamot opening.",
    details: "Clean and bright finish.",
    features: ["Fresh", "Citrus"],
  },
];

test("SCRUM-78 filters products by product name", () => {
  const results = filterProducts(sampleProducts, "Chanel");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "bleu-de-chanel");
});

test("SCRUM-79 filters products by short description", () => {
  const results = filterProducts(sampleProducts, "bergamot");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "sauvage");
});

test("SCRUM-79 filters products by detailed description", () => {
  const results = filterProducts(sampleProducts, "long-lasting");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "bleu-de-chanel");
});

test("search remains case-insensitive for product names", () => {
  const results = filterProducts(sampleProducts, "sAuVaGe");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "sauvage");
});

test("blank search returns all products", () => {
  const results = filterProducts(sampleProducts, "   ");

  assert.equal(results.length, sampleProducts.length);
});
