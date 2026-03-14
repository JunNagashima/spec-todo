"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Priority, Status, Task } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getTaskById, updateTask } from "@/actions/task";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/date";
import { type UpdateTaskInput, updateTaskSchema } from "@/schemas/task";

const priorityLabel: Record<Priority, string> = {
	HIGH: "高",
	MIDDLE: "中",
	LOW: "低",
};

const statusLabel: Record<Status, string> = {
	TODO: "TODO",
	DOING: "DOING",
	DONE: "DONE",
};

function toDateInputValue(date: Date): string {
	return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
		date,
	);
}

type TaskEditFormProps = {
	task: Task;
	onSuccess: () => void;
	onCancel: () => void;
};

function TaskEditForm({ task, onSuccess, onCancel }: TaskEditFormProps) {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<UpdateTaskInput>({
		resolver: zodResolver(updateTaskSchema),
		mode: "onBlur",
		defaultValues: {
			title: task.title,
			dueDate: toDateInputValue(task.dueDate),
			priority: task.priority,
			status: task.status,
		},
	});

	const onSubmit = async (data: UpdateTaskInput) => {
		const result = await updateTask(task.id, data);
		if (result.success) {
			toast.success("更新完了しました", { duration: 5000 });
			onSuccess();
		} else {
			toast.error("更新に失敗しました", { duration: 5000 });
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-3 text-sm"
		>
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<span className="w-16 shrink-0 text-gray-500">タイトル</span>
					<Input {...register("title")} className="flex-1" />
				</div>
				{errors.title && (
					<p className="ml-18 text-sm text-red-500">{errors.title.message}</p>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<span className="w-16 shrink-0 text-gray-500">期限</span>
					<input
						type="date"
						{...register("dueDate")}
						className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					/>
				</div>
				{errors.dueDate && (
					<p className="ml-18 text-sm text-red-500">{errors.dueDate.message}</p>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<span className="w-16 shrink-0 text-gray-500">優先度</span>
					<Controller
						control={control}
						name="priority"
						render={({ field }) => (
							<Select
								onValueChange={field.onChange}
								value={field.value}
								onOpenChange={() => field.onBlur()}
							>
								<SelectTrigger className="w-24">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="HIGH">高</SelectItem>
									<SelectItem value="MIDDLE">中</SelectItem>
									<SelectItem value="LOW">低</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				{errors.priority && (
					<p className="ml-18 text-sm text-red-500">
						{errors.priority.message}
					</p>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<span className="w-16 shrink-0 text-gray-500">ステータス</span>
					<Controller
						control={control}
						name="status"
						render={({ field }) => (
							<Select
								onValueChange={field.onChange}
								value={field.value}
								onOpenChange={() => field.onBlur()}
							>
								<SelectTrigger className="w-24">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="TODO">TODO</SelectItem>
									<SelectItem value="DOING">DOING</SelectItem>
									<SelectItem value="DONE">DONE</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				{errors.status && (
					<p className="ml-18 text-sm text-red-500">{errors.status.message}</p>
				)}
			</div>
			<div className="flex items-center gap-2">
				<span className="w-16 shrink-0 text-gray-500">登録日</span>
				<span>{formatDate(task.createdAt)}</span>
			</div>
			<div className="flex justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					キャンセル
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					更新
				</Button>
			</div>
		</form>
	);
}

type Props = {
	taskId: number;
	children: React.ReactNode;
};

export function TaskDetailDialog({ taskId, children }: Props) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [task, setTask] = useState<Task | null>(null);
	const [isEditing, setIsEditing] = useState(false);

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
		if (!value) {
			setTask(null);
			setIsEditing(false);
		}
	};

	const handleEditSuccess = () => {
		setIsEditing(false);
		setOpen(false);
		setTask(null);
	};

	return (
		<>
			<div
				onClick={handleOpen}
				onKeyDown={undefined}
				className="cursor-pointer"
			>
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
						task &&
						(isEditing ? (
							<TaskEditForm
								task={task}
								onSuccess={handleEditSuccess}
								onCancel={() => setIsEditing(false)}
							/>
						) : (
							<>
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
										<dd>{statusLabel[task.status]}</dd>
									</div>
									<div className="flex gap-2">
										<dt className="w-16 shrink-0 text-gray-500">登録日</dt>
										<dd>{formatDate(task.createdAt)}</dd>
									</div>
								</dl>
								<div className="flex justify-end pt-2">
									<Button variant="outline" onClick={() => setIsEditing(true)}>
										編集
									</Button>
								</div>
							</>
						))
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
