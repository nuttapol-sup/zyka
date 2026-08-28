import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "zyka_earth_tone_secret_key_2026_super_secure_token_987654321"
);

export interface TokenPayload {
  userId: string;
  name: string;
  username: string;
  role: "admin" | "user";
  allowedPages: string[];
}

export const COOKIE_NAME = "zyka_auth_token";

/**
 * Sign JWT Token
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const plainPayload = {
    userId: String(payload.userId),
    name: payload.name,
    username: payload.username,
    role: payload.role,
    allowedPages: Array.from(payload.allowedPages || []),
  };

  return await new SignJWT(plainPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // 24 hours
    .sign(JWT_SECRET);
}

/**
 * Verify JWT Token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current logged in user payload from cookies (Server Components / API Routes)
 */
export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
