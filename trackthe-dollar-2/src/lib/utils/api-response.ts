// src/lib/utils/api-response.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { API_ERRORS } from "./constants";

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Standard success response.
 */
export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200,
  headers?: HeadersInit
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status, ...(headers ? { headers } : {}) });
}

/**
 * Standard error response — never leaks stack traces.
 */
export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  headers?: HeadersInit
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status, ...(headers ? { headers } : {}) }
  );
}

export function unauthorizedError(): NextResponse<ApiError> {
  return apiError(API_ERRORS.UNAUTHORIZED, "Authentication required", 401);
}

export function forbiddenError(message = "Insufficient permissions"): NextResponse<ApiError> {
  return apiError(API_ERRORS.FORBIDDEN, message, 403);
}

export function notFoundError(resource = "Resource"): NextResponse<ApiError> {
  return apiError(API_ERRORS.NOT_FOUND, `${resource} not found`, 404);
}

export function validationError(error: ZodError): NextResponse<ApiError> {
  return apiError(
    API_ERRORS.VALIDATION_ERROR,
    "Validation failed",
    422,
    error.flatten().fieldErrors
  );
}

export function rateLimitError(headers: HeadersInit): NextResponse<ApiError> {
  return apiError(
    API_ERRORS.RATE_LIMITED,
    "Rate limit exceeded. Please slow down.",
    429,
    undefined,
    headers
  );
}

export function subscriptionError(requiredTier: string): NextResponse<ApiError> {
  return apiError(
    API_ERRORS.SUBSCRIPTION_REQUIRED,
    `This feature requires a ${requiredTier} subscription.`,
    403
  );
}

export function internalError(
  err: unknown,
  context?: string
): NextResponse<ApiError> {
  // Log full error server-side, return generic message to client
  console.error(`[API Error]${context ? ` [${context}]` : ""}`, err);
  return apiError(
    API_ERRORS.INTERNAL_ERROR,
    "An unexpected error occurred. Please try again.",
    500
  );
}

/**
 * Parse ZodError from URL search params.
 */
export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: ZodError } }
):
  | { success: true; data: T }
  | { success: false; response: NextResponse<ApiError> } {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { success: false, response: validationError(result.error) };
  }
  return { success: true, data: result.data };
}

/**
 * Parse JSON body with Zod schema.
 */
export async function parseBody<T>(
  req: Request,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: ZodError } }
): Promise<
  | { success: true; data: T }
  | { success: false; response: NextResponse<ApiError> }
> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      success: false,
      response: apiError(API_ERRORS.VALIDATION_ERROR, "Invalid JSON body", 400),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, response: validationError(result.error) };
  }
  return { success: true, data: result.data };
}
