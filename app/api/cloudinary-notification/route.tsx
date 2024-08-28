import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("Cloudinary Notification:", body.info);

		// You can handle the notification data here, e.g., store the details in your database

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("Notification handling error:", error);
		return NextResponse.json({ error: "Notification handling failed" }, { status: 500 });
	}
}
