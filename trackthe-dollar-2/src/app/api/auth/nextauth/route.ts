// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth/session";

export const runtime = "nodejs";

export const { GET, POST } = handlers;
