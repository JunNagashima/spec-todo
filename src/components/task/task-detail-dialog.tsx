"use client";

import type { Task } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getTaskById } from "@/actions/task";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/date";

const priorityLabel: Record<string, string> = {
	HIGH: "高",
	MIDDLE: "中",
	LOW: "低",
};

type Props = {
	taskId: number;
	children: React.ReactNode;
};

export function TaskDetailDialog({ taskId, children }: Props) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [task, setTask] = useState<Task | null>(null);

	const handleOpen = async () => {
		setOpen(true);
		setLoading(true);
		const result = await getTaskById(taskId);
		if (!result.success) {
			setLoading(false);
			toast.error("取得に失敗しました", { duration: 5000 });
			setOpen(false);
			return;
		}
		setTask(result.data);
		setLoading(false);
	};

	const handleOpenChange = (value: boolean) => {
		setOpen(value);
		if (!value) setTask(null);
	};

	return (
		<>
			<div onClick={handleOpen} onKeyDown={undefined} className="cursor-pointer">
				{children}
			</div>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>タスク詳細</DialogTitle>
					</DialogHeader>
					{loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="animate-spin" />
						</div>
					) : (
						task && (
							<dl className="flex flex-col gap-3 text-sm">
								<div className="flex gap-2">
									<dt className="w-16 shrink-0 text-gray-500">タイトル</dt>
									<dd>{task.title}</dd>
								</div>
								<div className="flex gap-2">
									<dt className="w-16 shrink-0 text-gray-500">期限</dt>
									<dd>{formatDate(task.dueDate)}</dd>
								</div>
								<div className="flex gap-2">
									<dt className="w-16 shrink-0 text-gray-500">優先度</dt>
									<dd>{priorityLabel[task.priority]}</dd>
								</div>
								<div className="flex gap-2">
									<dt className="w-16 shrink-0 text-gray-500">ステータス</dt>
									<dd>{task.status}</dd>
								</div>
								<div className="flex gap-2">
									<dt className="w-16 shrink-0 text-gray-500">登録日</dt>
									<dd>{formatDate(task.createdAt)}</dd>
								</div>
							</dl>
						)
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
