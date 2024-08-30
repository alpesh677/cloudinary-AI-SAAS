import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDNIARY_API_SECRET,
});

interface CloudinaryResult {
	public_id: string;
	[key: string]: any;
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json(
				{ error: "File Not Found" },
				{ status: 401 },
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const result = await new Promise<CloudinaryResult>(
			(resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						folder: "Cloudinary-saas-images",
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result as CloudinaryResult);
					},
				);

				uploadStream.end(buffer);
			},
		);

		console.log("Upload Image Success", result);
		return NextResponse.json(
			{
				public_id: result.public_id,
				width : result.width,
				height : result.height,
				secure_url: result.secure_url,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.log("Upload Image Error", error);
		return NextResponse.json(
			{
				error: "Upload Image Failed",
			},
			{ status: 500 },
		);
	}
}
