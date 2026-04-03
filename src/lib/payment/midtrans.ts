/** Midtrans Snap integration — create snap tokens for payment popup. */
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

interface CreateSnapTokenParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  tierName: string;
}

/** Create a Midtrans Snap token for payment popup. */
export async function createSnapToken(params: CreateSnapTokenParams): Promise<string> {
  // midtrans-client types are incomplete, cast to allow full Snap API params
  const transactionParams = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
    },
    item_details: [
      {
        id: params.tierName,
        price: params.amount,
        quantity: 1,
        name: `PeduliStunting ${params.tierName} — 1 Bulan`,
      },
    ],
  };

  const transaction = await snap.createTransaction(
    transactionParams as Parameters<typeof snap.createTransaction>[0]
  );

  return transaction.token as string;
}

/** Verify Midtrans webhook signature. */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === signatureKey;
}
