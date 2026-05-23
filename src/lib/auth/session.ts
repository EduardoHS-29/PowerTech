import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
const SESSION_MAX_AGE = parseInt(
  process.env.AUTH_SESSION_MAX_AGE ?? "86400",
  10
);

export interface SessionPayload {
  userId: string;
  email: string;
  nome: string;
}

type SessionJWTPayload = JWTPayload & SessionPayload;

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as SessionJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const p = payload as SessionJWTPayload;
    if (!p.userId || !p.email || !p.nome) return null;
    return { userId: p.userId, email: p.email, nome: p.nome };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
