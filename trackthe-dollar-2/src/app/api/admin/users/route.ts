// src/app/api/admin/users/route.ts
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db/prisma";
import {
  apiSuccess,
  unauthorizedError,
  forbiddenError,
  internalError,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedError();
  if (session.user.role !== "ADMIN") return forbiddenError("Admin access required.");

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: {
            select: { tier: true, status: true, stripeCurrentPeriodEnd: true },
          },
        },
      }),
      db.user.count(),
    ]);

    return apiSuccess(users, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return internalError(err, "admin:users:GET");
  }
}
