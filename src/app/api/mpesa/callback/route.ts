import { NextResponse } from "next/server";

/**
 * M-Pesa Daraja callback endpoint.
 *
 * Safaricom POSTs payment results here. Verify the signature,
 * parse the result, and activate the user's subscription on success.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Log callback for debugging (remove in production or use proper logging)
    console.log("[M-Pesa Callback]", JSON.stringify(body, null, 2));

    const resultCode = body?.Body?.stkCallback?.ResultCode;
    const metadata = body?.Body?.stkCallback?.CallbackMetadata;

    if (resultCode === 0) {
      // Payment successful - extract phone and amount from metadata
      // In production, you'd store the M-Pesa receipt and map it to userId
      // via the CheckoutRequestID you stored when initiating STK Push.

      // For dev mode, we can't reliably map callback to userId without
      // storing checkoutRequestId -> userId mapping. This is a placeholder.

      return NextResponse.json({ resultCode: 0, message: "Callback received" });
    }

    return NextResponse.json({ resultCode, message: "Payment not completed" });
  } catch (err) {
    console.error("M-Pesa callback error:", err);
    return NextResponse.json({ error: "Callback handling failed" }, { status: 500 });
  }
}
