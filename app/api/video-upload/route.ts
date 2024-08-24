import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDNIARY_API_SECRET,
});

interface CloudinaryUploadResult {
	public_id: string;
	bytes: number;
	duration?: number;
	[key: string]: any;
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
	try {
		const { userId } = auth();

		// console.log(userId)
		if (!userId) {
			return NextResponse.json(
				{
					error: "Unauthorized Request",
				},
				{ status: 401 },
			);
		}

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
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const originalSize = formData.get("originalSize") as string;

		if (!file)
			return NextResponse.json(
				{
					error: "File Not Found",
				},
				{ status: 404 },
			);

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const result = await new Promise<CloudinaryUploadResult>(
			(resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						resource_type: "video",
						folder: "Cloudinary-saas-videos",
						transformation: [
							{ quality: "auto", fetch_format: "mp4" },
						],
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result as CloudinaryUploadResult);
					},
				); 
				uploadStream.end(buffer);
			},
		);

		const video = await prisma.video.create({
			data: {
				title,
				description,
				originalSize,
				publicId: result.public_id,
				compressedSize: String(result.bytes),
				duration: result.duration || 0,
			},
		});

		return NextResponse.json(
			{
				video,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.log("Uploading video Error :", error);
		return NextResponse.json(
			{
				error: "Upload video Error",
			},
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
