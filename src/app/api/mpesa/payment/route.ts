import { NextResponse } from "next/server";

/**
 * M-Pesa payment integration placeholder.
 *
 * In production, integrate with Safaricom Daraja API:
 * 1. Get OAuth access token
 * 2. Initiate STK Push (Lipa na M-Pesa Online)
 * 3. Handle callback to confirm payment
 * 4. Activate subscription on success
 *
 * For now, this endpoint accepts a payment request and simulates
 * successful activation in dev mode.
 */

interface MpesaRequest {
  phoneNumber: string;
  amount: number;
  userId: string;
  planId: string;
}

export async function POST(req: Request) {
  try {
    const { phoneNumber, amount, userId, planId }: MpesaRequest = await req.json();

    if (!phoneNumber || !amount || !userId || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Format phone number (Kenya: 254XXXXXXXXX)
    const normalizedPhone = phoneNumber.startsWith("0")
      ? "254" + phoneNumber.slice(1)
      : phoneNumber.replace("+", "");

    // Dev mode: simulate successful M-Pesa payment
    // In production, call Safaricom Daraja API here
    console.log("[M-Pesa Dev Mode] Simulated payment:", {
      phone: normalizedPhone,
      amount,
      userId,
      planId,
    });

    return NextResponse.json({
      success: true,
      devMode: true,
      message: "M-Pesa STK Push simulated. In production, integrate with Daraja API.",
      checkoutRequestId: `dev_mpesa_${Date.now()}`,
      phone: normalizedPhone,
      amount,
    });
  } catch (err) {
    console.error("M-Pesa payment error:", err);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
