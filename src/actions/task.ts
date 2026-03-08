"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/schemas/task";
import type { Priority } from "@prisma/client";

export async function createTask(data: unknown) {
  const parsed = createTaskSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "入力内容が正しくありません。" } as const;
  }

  const { title, dueDate, priority } = parsed.data;

  try {
    await prisma.task.create({
      data: {
        title,
        dueDate: new Date(dueDate),
        priority: priority as Priority,
        status: "TODO",
      },
    });
    revalidatePath("/");
    return { success: true } as const;
  } catch {
    return { success: false, error: "登録に失敗しました" } as const;
  }
}
