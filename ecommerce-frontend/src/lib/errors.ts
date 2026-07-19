import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

// FastAPI error `detail` is either a plain string (your HTTPException calls)
// or a list of validation error objects (422 from Pydantic). This flattens
// both into one string safe to show in the UI.
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (!data?.detail) return fallback;

    if (typeof data.detail === "string") return data.detail;

    return data.detail.map((e) => e.msg).join(", ");
  }
  return fallback;
}
