import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { layouts } = await req.json();

    if (!Array.isArray(layouts)) {
      return NextResponse.json({ error: "Invalid payload: layouts must be an array" }, { status: 400 });
    }

    // Execute bulk updates in a transaction
    const updates = layouts.map((item) => 
      prisma.note.update({
        where: { 
          id: String(item.id),
          userId: session.user.id 
        },
        data: {
          positionX: item.x,
          positionY: item.y,
          colSpan: item.w,
          rowSpan: item.h
        }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    console.error("Reorder notes error:", error);
    return NextResponse.json({ error: "Failed to reorder notes" }, { status: 500 });
  }
}
