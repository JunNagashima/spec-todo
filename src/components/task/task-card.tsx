import type { Priority, Task } from "@prisma/client";
import { formatDate } from "@/lib/date";

const priorityLabel: Record<Priority, string> = {
	HIGH: "高",
	MIDDLE: "中",
	LOW: "低",
};

const priorityClass: Record<Priority, string> = {
	HIGH: "bg-red-100 text-red-700",
	MIDDLE: "bg-yellow-100 text-yellow-700",
	LOW: "bg-blue-100 text-blue-700",
};

type Props = {
	task: Task;
};

export function TaskCard({ task }: Props) {
	return (
		<div className="rounded-lg border bg-white p-3 shadow-sm flex flex-col gap-2">
			<p className="text-sm font-medium">{task.title}</p>
			<p className="text-xs text-gray-500">期限: {formatDate(task.dueDate)}</p>
			<span
				className={`self-start rounded px-2 py-0.5 text-xs font-medium ${priorityClass[task.priority]}`}
			>
				{priorityLabel[task.priority]}
			</span>
		</div>
	);
}
