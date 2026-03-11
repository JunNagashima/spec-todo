import { Suspense } from "react";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { KanbanBoard } from "@/components/task/kanban-board";
import { KanbanBoardErrorBoundary } from "@/components/task/kanban-board-error-boundary";
import { KanbanBoardSkeleton } from "@/components/task/kanban-board-skeleton";
import {
	sortFieldSchema,
	sortOrderSchema,
	type SortField,
	type SortOrder,
} from "@/schemas/task";

type SearchParams = Promise<{ sortField?: string; sortOrder?: string }>;

export default async function Home({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;
	const sortFieldResult = sortFieldSchema.safeParse(params.sortField);
	const sortOrderResult = sortOrderSchema.safeParse(params.sortOrder);
	const sortField: SortField = sortFieldResult.success
		? sortFieldResult.data
		: "createdAt";
	const sortOrder: SortOrder = sortOrderResult.success
		? sortOrderResult.data
		: "desc";

	return (
		<main className="min-h-screen p-8">
			<KanbanBoardErrorBoundary>
				<Suspense fallback={<KanbanBoardSkeleton />}>
					<KanbanPageContent sortField={sortField} sortOrder={sortOrder} />
				</Suspense>
			</KanbanBoardErrorBoundary>
		</main>
	);
}

async function KanbanPageContent({
	sortField,
	sortOrder,
}: {
	sortField: SortField;
	sortOrder: SortOrder;
}) {
	return (
		<>
			<div className="mb-6 flex justify-end">
				<CreateTaskDialog />
			</div>
			<KanbanBoard sortField={sortField} sortOrder={sortOrder} />
		</>
	);
}
