import { z } from "zod";
import { isDateTodayOrLater } from "@/lib/date";

export const createTaskSchema = z.object({
	title: z
		.string()
		.min(1, "タスク名を入力してください。")
		.max(30, "タスク名は30文字以内で入力してください。"),
	dueDate: z
		.string()
		.min(1, "期限を入力してください。")
		.refine(isDateTodayOrLater, "期限は今日以降の日付を入力してください。"),
	priority: z.enum(["HIGH", "MIDDLE", "LOW"], "優先順位を入力してください。"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
