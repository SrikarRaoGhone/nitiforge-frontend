import { logSecurityEvent } from "./logging";

export function createSafeErrorResponse(error, context = {}) {
  logSecurityEvent("handled_exception", {
    context,
    message: error?.message || "Unknown error",
  });

  const isProduction = process.env.NODE_ENV === "production";

  return Response.json(
    {
      error: context.publicMessage || "Request failed",
      ...(isProduction ? {} : { detail: error?.message || "Unknown error" }),
    },
    { status: context.status || 500 },
  );
}

export function createValidationErrorResponse(reason, status = 400) {
  return Response.json(
    {
      error: "Request validation failed",
      detail: reason,
    },
    { status },
  );
}
