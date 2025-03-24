import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        teacherId: params.teacherId,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("[TEACHER_SUBJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 