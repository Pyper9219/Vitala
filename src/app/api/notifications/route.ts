import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { title, body, channel, phoneNumber, userId } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const result = await sendNotification({
      userId: userId || "anonymous",
      title,
      body,
      channel: (channel as any) || "in_app",
      phoneNumber,
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Notification API error:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
