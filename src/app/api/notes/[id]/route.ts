import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await props.params;
    const body = await req.json();
    
    // Authorization check
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id }
    });
    
    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { title, content, category, isPinned, color, colSpan, rowSpan } = body;

    const note = await prisma.note.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : existingNote.title,
        content: content !== undefined ? content : existingNote.content,
        category: category !== undefined ? category : existingNote.category,
        color: color !== undefined ? color : existingNote.color,
        colSpan: colSpan !== undefined ? colSpan : existingNote.colSpan,
        rowSpan: rowSpan !== undefined ? rowSpan : existingNote.rowSpan,
        isPinned: isPinned !== undefined ? isPinned : existingNote.isPinned,
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await props.params;

    // Authorization check
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id }
    });
    
    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
