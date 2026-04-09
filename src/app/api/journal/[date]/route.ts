import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseISO, startOfDay } from "date-fns";

const paramsSchema = z.object({
  date: z.string().transform((str) => startOfDay(parseISO(str))),
});

const bodySchema = z.object({
  content: z.string(),
  mood: z.string().nullable().optional(),
});

export async function GET(req: Request, props: { params: Promise<{ date: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await props.params;
  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const { date } = parsed.data;

  try {
    const entry = await prisma.journalEntry.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
    });

    return NextResponse.json(entry || { content: "", mood: null });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ date: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await props.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const body = await req.json();
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) return NextResponse.json({ error: parsedBody.error }, { status: 400 });

  const { date } = parsedParams.data;
  const { content, mood } = parsedBody.data;

  try {
    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      update: {
        content,
        mood,
      },
      create: {
        userId: session.user.id,
        date,
        content,
        mood: mood || null,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to upsert journal entry", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
