import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDNIARY_API_SECRET,
});

export async function GET(req: NextRequest) {
	const fullPath = req.nextUrl.searchParams.get("fullPath");

	if (!fullPath) {
		return NextResponse.json(
			{ error: "Invalid fullPath parameter" },
			{ status: 400 },
		);
	}

	try {
		await cloudinary.api.resource(fullPath, {
			resource_type: "raw",
		});
		return NextResponse.json({ ready: true }, { status: 200 });
	} catch (error: any) {
		if (error.http_code === 404) {
			return NextResponse.json({ ready: false }, { status: 200 });
		} else {
			return NextResponse.json(
				{ error: "Error checking SRT file" },
				{ status: 500 },
			);
		}
	}
}

export async function handler(req: NextRequest) {
	if (req.method !== "GET") {
		return NextResponse.json(
			{ error: "Method Not Allowed" },
			{ status: 405 },
		);
	}

	return GET(req);
}
