import bleuDeChanel1 from "../assets/bleu-de-chanel-1.avif";
import bleuDeChanel2 from "../assets/bleu-de-chanel-2.avif";

export const products = [
  {
    id: "bleu-de-chanel",
    name: "Bleu de Chanel",
    volume: "100 ml / 3.38 fl. oz.",
    price: 210,
    currency: "USD",
    shortDescription:
      "Bleu de Chanel is a woody, spicy fragrance that is perfect for men who want to make a statement.",
    features: ["Woody", "Spicy", "Long-lasting", "Versatile"],
    details:
      "Bleu de Chanel is a woody, spicy fragrance that is perfect for men who want to make a statement. It is a long-lasting fragrance that is versatile and can be worn for any occasion.",
    mainImage: bleuDeChanel1,
    thumbnails: [bleuDeChanel1, bleuDeChanel2],
  },
];

export function getProductById(productId) {
  return products.find((product) => product.id === productId);
}
