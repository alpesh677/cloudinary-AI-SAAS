import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDNIARY_API_SECRET,
});

export async function POST(request: Request) {
	if (
		!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
		!process.env.CLOUDINARY_API_KEY ||
		!process.env.CLOUDNIARY_API_SECRET
	) {
		return NextResponse.json(
			{
				error: "Cloudinary credentials not found",
			},
			{ status: 401 },
		);
	}

	const formData = await request.formData();
	const file = formData.get("file") as File | null;
	if (!file) {
		return NextResponse.json({ error: "File Not found" }, { status: 404 });
	}

	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);

	try {
		const result = await new Promise<any>((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					resource_type: "video",
					folder: "Cloudinary-saas-videos",
					raw_convert: "google_speech:srt",
				},
				(error, result) => {
					// console.log(result);
					if (error) reject(error);
					else resolve(result);
				},
			);
			uploadStream.end(buffer);
		});
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
