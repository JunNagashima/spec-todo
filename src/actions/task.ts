"use server";

import type { Priority, Status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
	createTaskSchema,
	type SortField,
	type SortOrder,
	updateTaskSchema,
} from "@/schemas/task";

export async function getTasks(
	sortField: SortField = "createdAt",
	sortOrder: SortOrder = "desc",
	searchTitle?: string,
) {
	try {
		const tasks = await prisma.task.findMany({
			where: searchTitle ? { title: { contains: searchTitle } } : {},
			orderBy: { [sortField]: sortOrder },
		});
		return { success: true, data: tasks } as const;
	} catch {
		return { success: false, error: "一覧取得に失敗しました" } as const;
	}
}

export async function getTaskById(id: number) {
	try {
		const task = await prisma.task.findUnique({ where: { id } });
		if (!task)
			return { success: false, error: "タスクが見つかりません" } as const;
		return { success: true, data: task } as const;
	} catch {
		return { success: false, error: "取得に失敗しました" } as const;
	}
}

export async function updateTask(id: number, data: unknown) {
	const parsed = updateTaskSchema.safeParse(data);
	if (!parsed.success) {
		return { success: false, error: "入力内容が正しくありません。" } as const;
	}

	const { title, dueDate, priority, status } = parsed.data;

	try {
		await prisma.task.update({
			where: { id },
			data: {
				title,
				dueDate: new Date(dueDate),
				priority: priority as Priority,
				status: status as Status,
			},
		});
		revalidatePath("/");
		return { success: true } as const;
	} catch {
		return { success: false, error: "更新に失敗しました" } as const;
	}
}

export async function deleteTask(id: number) {
	try {
		await prisma.task.delete({ where: { id } });
		revalidatePath("/");
		return { success: true } as const;
	} catch {
		return { success: false, error: "削除に失敗しました" } as const;
	}
}

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
