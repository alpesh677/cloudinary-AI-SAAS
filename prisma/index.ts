import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

console.log("fnldnfkd:",process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient();
} else {
	// In development, use a global variable to avoid exhausting database connections
	if (!(global as any).__prisma) {
		(global as any).__prisma = new PrismaClient();
	}
	prisma = (global as any).__prisma;
}

export default prisma;
