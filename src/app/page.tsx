import { Suspense } from "react";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { KanbanBoard } from "@/components/task/kanban-board";
import { KanbanBoardErrorBoundary } from "@/components/task/kanban-board-error-boundary";
import { KanbanBoardSkeleton } from "@/components/task/kanban-board-skeleton";

export default function Home() {
	return (
		<main className="min-h-screen p-8">
			<KanbanBoardErrorBoundary>
				<Suspense fallback={<KanbanBoardSkeleton />}>
					<KanbanPageContent />
				</Suspense>
			</KanbanBoardErrorBoundary>
		</main>
	);
}

async function KanbanPageContent() {
	return (
		<>
			<div className="mb-6 flex justify-end">
				<CreateTaskDialog />
			</div>
			<KanbanBoard />
		</>
	);
}
