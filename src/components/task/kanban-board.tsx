import { getTasks } from "@/actions/task";
import { KanbanColumn } from "./kanban-column";

export async function KanbanBoard() {
	const result = await getTasks();

	if (!result.success) {
		throw new Error("一覧取得に失敗しました");
	}

	const tasks = result.data;
	const todoTasks = tasks.filter((t) => t.status === "TODO");
	const doingTasks = tasks.filter((t) => t.status === "DOING");
	const doneTasks = tasks.filter((t) => t.status === "DONE");

	return (
		<div className="flex gap-4">
			<KanbanColumn title="TODO" tasks={todoTasks} />
			<KanbanColumn title="DOING" tasks={doingTasks} />
			<KanbanColumn title="DONE" tasks={doneTasks} />
		</div>
	);
}
