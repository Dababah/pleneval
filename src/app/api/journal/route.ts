import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch last 365 days of entries for heatmap
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: subDays(new Date(), 365),
        },
      },
      select: {
        date: true,
        mood: true,
        content: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch journal entries", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
