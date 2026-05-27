import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: {
      id: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}
