// pages/api/prices.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("❌ Define STRIPE_SECRET_KEY en tu .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

// Agrega aquí los Price IDs que quieras consultar
const PRICE_IDS = [
  "price_1RUMPGAcJO7HLuIPHD8OG8g0",
  "price_1RVf63AcJO7HLuIPtYufjll7",
  "price_1RVf6kAcJO7HLuIPqwAJQJNI",
];

type PriceInfo = {
  priceId: string;
  unitAmount: number;   // en centavos
  amountFormatted: string; // ej. "150.00"
  currency: string;     // ej. "mxn"
  productId: string;
  productName: string;
  productDescription: string | null;
  priceNickname: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ prices: PriceInfo[] } | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const results: PriceInfo[] = [];

    for (const priceId of PRICE_IDS) {
      // 1) Recuperar el objeto Price
      const price = await stripe.prices.retrieve(priceId);

      if (!price || price.object !== "price") {
        // Si no existe o no es un price válido, lo saltamos
        continue;
      }

      // 2) Recuperar el objeto Product al que pertenece este Price
      // price.product puede ser un string (ID) o un objeto con id
      const productId =
        typeof price.product === "string" ? price.product : price.product.id;
      const product = await stripe.products.retrieve(productId);

      // 3) Construir la entrada con la información deseada
      const unitAmount = price.unit_amount || 0; // en centavos
      const amountFormatted = (unitAmount / 100).toFixed(2); // ej. "150.00"

      results.push({
        priceId,
        unitAmount,
        amountFormatted,
        currency: price.currency,
        productId,
        productName: product.name,
        productDescription: product.description || null,
        priceNickname: price.nickname || null,
      });
    }

    return res.status(200).json({ prices: results });
  } catch (err: any) {
    console.error("Error en /api/prices:", err);
    return res.status(500).json({ error: "Error interno al consultar precios." });
  }
}
