"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@prisma/client";
import { TaskCard } from "./task-card";

type Props = {
	task: Task;
	isUpdating: boolean;
};

export function DraggableTaskCard({ task, isUpdating }: Props) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: task.id,
			data: { task },
			disabled: isUpdating,
		});

	const style: React.CSSProperties = {
		transform: transform
			? `translate3d(${transform.x}px, ${transform.y}px, 0)`
			: undefined,
		opacity: isDragging ? 0.5 : 1,
		cursor: isUpdating ? "not-allowed" : undefined,
	};

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<TaskCard task={task} />
		</div>
	);
}
