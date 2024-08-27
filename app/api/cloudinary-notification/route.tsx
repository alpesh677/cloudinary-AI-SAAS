import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const { public_id, secure_url, notification_type } = await req.json();

    if (notification_type === 'notification' && public_id.endsWith('.srt')) {
        console.log(`Subtitle file for ${public_id} is ready at ${secure_url}`);
    }

    return NextResponse.json({ message: 'Notification received' }, { status: 201 });
}