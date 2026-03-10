import type { Task } from "@prisma/client";
import { TaskCard } from "./task-card";

type Props = {
	title: string;
	tasks: Task[];
};

export function KanbanColumn({ title, tasks }: Props) {
	return (
		<div className="flex flex-1 flex-col gap-3 rounded-lg bg-gray-50 p-4">
			<h2 className="text-sm font-semibold text-gray-600">{title}</h2>
			{tasks.map((task) => (
				<TaskCard key={task.id} task={task} />
			))}
		</div>
	);
}
