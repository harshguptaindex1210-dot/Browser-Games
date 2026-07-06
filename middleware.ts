import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildDeviceCookie,
  generateDeviceId,
  parseDeviceCookie,
} from "@/lib/device/device-id";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = parseDeviceCookie(request.headers.get("cookie"));

  if (!existing) {
    const id = generateDeviceId();
    response.headers.set("Set-Cookie", buildDeviceCookie(id));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|games/).*)"],
};
