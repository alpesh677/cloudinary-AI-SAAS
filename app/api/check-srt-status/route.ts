import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDNIARY_API_SECRET,
});

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const publicId = searchParams.get("publicId");

	if (!publicId) {
		return NextResponse.json(
			{ error: "Public ID is required" },
			{ status: 400 },
		);
	}

	try {
		const result = await cloudinary.api.resource(publicId, {
			resource_type: "video",
		});
		const srtUrl = result.derived.find(
			(item: any) => item.format === "srt",
		)?.secure_url;

		return NextResponse.json({ ready: !!srtUrl }, { status: 200 });
	} catch (error) {
		console.error("Error checking SRT status:", error);
		return NextResponse.json(
			{ error: "Failed to check SRT status" },
			{ status: 500 },
		);
	}
}
