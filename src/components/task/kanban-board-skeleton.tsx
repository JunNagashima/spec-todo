function CardSkeleton() {
	return (
		<div className="rounded-lg border bg-white p-3 shadow-sm flex flex-col gap-2">
			<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
			<div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
			<div className="h-5 w-8 animate-pulse rounded bg-gray-200" />
		</div>
	);
}

function ColumnSkeleton() {
	return (
		<div className="flex flex-1 flex-col gap-3 rounded-lg bg-gray-50 p-4">
			<div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
			<CardSkeleton />
			<CardSkeleton />
			<CardSkeleton />
		</div>
	);
}

export function KanbanBoardSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex justify-end">
				<div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
			</div>
			<div className="flex gap-4">
				<ColumnSkeleton />
				<ColumnSkeleton />
				<ColumnSkeleton />
			</div>
		</div>
	);
}
