import { createHmac, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "scu_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const DEV_FALLBACK_SECRET = "scu-dev-session-secret-change-me";

interface SessionPayload {
  login: string;
  role: "admin";
  exp: number;
}

export interface AdminSession {
  login: string;
  role: "admin";
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }

  return DEV_FALLBACK_SECRET;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "===".slice((normalized.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function buildSessionToken(login: string): string {
  const payload: SessionPayload = {
    login,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (payload.role !== "admin" || typeof payload.login !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function getCookieValueFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookiesParts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of cookiesParts) {
    if (part.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return decodeURIComponent(part.slice(SESSION_COOKIE_NAME.length + 1));
    }
  }
  return null;
}

export function getAdminCredentials(): { login: string; password: string } {
  return {
    login: process.env.ADMIN_LOGIN?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD?.trim() || "12345",
  };
}

export function createSessionCookie(login: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: SESSION_COOKIE_NAME,
    value: buildSessionToken(login),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    },
  };
}

export function clearSessionCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    },
  };
}

export async function validateAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = parseSessionToken(token);
  if (!payload) {
    return null;
  }

  return {
    login: payload.login,
    role: payload.role,
  };
}

export function validateAdminRequest(request: NextRequest | Request): AdminSession | null {
  const token = getCookieValueFromHeader(request.headers.get("cookie"));
  const payload = parseSessionToken(token);
  if (!payload) {
    return null;
  }

  return {
    login: payload.login,
    role: payload.role,
  };
}
