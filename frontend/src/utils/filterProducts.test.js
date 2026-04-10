import test from "node:test";
import assert from "node:assert/strict";
import {
  filterProducts,
  getSearchStatus,
  shouldShowNoResultsState,
} from "./filterProducts.js";

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

test("SCRUM-80 keeps short-description search case-insensitive", () => {
  const results = filterProducts(sampleProducts, "BeRgAmOt");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "sauvage");
});

test("SCRUM-80 keeps detailed-description search case-insensitive", () => {
  const results = filterProducts(sampleProducts, "LoNg-LaStInG");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "bleu-de-chanel");
});

test("SCRUM-80 keeps feature search case-insensitive", () => {
  const results = filterProducts(sampleProducts, "cItRuS");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "sauvage");
});

test("blank search returns all products", () => {
  const results = filterProducts(sampleProducts, "   ");

  assert.equal(results.length, sampleProducts.length);
});

test("SCRUM-81 returns no products when nothing matches", () => {
  const results = filterProducts(sampleProducts, "amber vanilla");

  assert.equal(results.length, 0);
});

test("SCRUM-81 marks search status as empty when no products match", () => {
  const results = filterProducts(sampleProducts, "amber vanilla");

  assert.equal(getSearchStatus("amber vanilla", results.length), "empty");
});

test("SCRUM-81 shows the no-results state only for non-empty searches with zero matches", () => {
  assert.equal(shouldShowNoResultsState("amber vanilla", 0), true);
  assert.equal(shouldShowNoResultsState("   ", 0), false);
  assert.equal(shouldShowNoResultsState("chanel", 1), false);
});
