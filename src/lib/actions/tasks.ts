"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  category: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    if (!(prisma as any).task) {
      console.warn("Prisma Task model missing. Returning fallback data.");
      return [
        { id: '1', title: 'Initialize Plen Core', priority: 'high', status: 'done', createdAt: new Date() },
        { id: '2', title: 'Neural Sync Pending...', priority: 'medium', status: 'in_progress', createdAt: new Date() },
      ];
    }
    return await (prisma as any).task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    return [];
  }
}

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData.entries());
  const validated = taskSchema.parse(data);

  try {
    if (!(prisma as any).task) return;
    await (prisma as any).task.create({
      data: {
        ...validated,
        userId: session.user.id,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      },
    });

    revalidatePath("/[lang]/tasks", "page");
    revalidatePath("/[lang]/dashboard", "page");
  } catch (err) {
    console.error(err);
  }
}

export async function updateTaskStatus(id: string, status: "todo" | "in_progress" | "done") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    if (!(prisma as any).task) return;
    await (prisma as any).task.update({
      where: { id, userId: session.user.id },
      data: { status },
    });

    revalidatePath("/[lang]/tasks", "page");
    revalidatePath("/[lang]/dashboard", "page");
  } catch (err) {}
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    if (!(prisma as any).task) return;
    await (prisma as any).task.delete({
      where: { id, userId: session.user.id },
    });

    revalidatePath("/[lang]/tasks", "page");
    revalidatePath("/[lang]/dashboard", "page");
  } catch (err) {}
}
