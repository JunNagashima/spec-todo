import { getTasks } from "@/actions/task";
import type { SortField, SortOrder } from "@/schemas/task";
import { SearchTitleForm } from "./search-title-form";
import { SortControl } from "./sort-control";
import { KanbanColumn } from "./kanban-column";

type Props = {
	sortField: SortField;
	sortOrder: SortOrder;
	searchTitle?: string;
};

export async function KanbanBoard({ sortField, sortOrder, searchTitle }: Props) {
	const result = await getTasks(sortField, sortOrder, searchTitle);

	if (!result.success) {
		throw new Error("一覧取得に失敗しました");
	}

	const tasks = result.data;
	const todoTasks = tasks.filter((t) => t.status === "TODO");
	const doingTasks = tasks.filter((t) => t.status === "DOING");
	const doneTasks = tasks.filter((t) => t.status === "DONE");

	return (
		<div>
			<SearchTitleForm
				sortField={sortField}
				sortOrder={sortOrder}
				searchTitle={searchTitle}
			/>
			<SortControl sortField={sortField} sortOrder={sortOrder} />
			<div className="flex gap-4">
				<KanbanColumn title="TODO" tasks={todoTasks} />
				<KanbanColumn title="DOING" tasks={doingTasks} />
				<KanbanColumn title="DONE" tasks={doneTasks} />
			</div>
		</div>
	);
}
