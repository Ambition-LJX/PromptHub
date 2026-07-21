import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/config/db";
import {
  comparePassword,
  signToken,
  setAuthCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码都是必填项" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true, email: true, password: true, role: true, provider: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // OAuth 用户没有密码，不能用密码登录
    if (!user.password) {
      const providerName = user.provider === "github" ? "GitHub" : "第三方";
      return NextResponse.json(
        { error: `该账号使用 ${providerName} 登录，请点击下方对应按钮登录` },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
