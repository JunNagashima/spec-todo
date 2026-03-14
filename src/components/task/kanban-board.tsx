import { getTasks } from "@/actions/task";
import type { SortField, SortOrder } from "@/schemas/task";
import { KanbanBoardClient } from "./kanban-board-client";
import { SearchTitleForm } from "./search-title-form";
import { SortControl } from "./sort-control";

type Props = {
	sortField: SortField;
	sortOrder: SortOrder;
	searchTitle?: string;
};

export async function KanbanBoard({
	sortField,
	sortOrder,
	searchTitle,
}: Props) {
	const result = await getTasks(sortField, sortOrder, searchTitle);

	if (!result.success) {
		throw new Error("一覧取得に失敗しました");
	}

	return (
		<div>
			<SearchTitleForm
				sortField={sortField}
				sortOrder={sortOrder}
				searchTitle={searchTitle}
			/>
			<SortControl sortField={sortField} sortOrder={sortOrder} />
			<KanbanBoardClient tasks={result.data} />
		</div>
	);
}
