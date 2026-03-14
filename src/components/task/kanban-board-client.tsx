"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import type { Status, Task } from "@prisma/client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DraggableTaskCard } from "./draggable-task-card";
import { DroppableColumn } from "./droppable-column";
import { TaskCard } from "./task-card";

const COLUMNS: { id: Status; title: string }[] = [
	{ id: "TODO", title: "TODO" },
	{ id: "DOING", title: "DOING" },
	{ id: "DONE", title: "DONE" },
];

type Props = {
	tasks: Task[];
};

export function KanbanBoardClient({ tasks: initialTasks }: Props) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const handleDragStart = useCallback((event: DragStartEvent) => {
		const task = event.active.data.current?.task as Task | undefined;
		setActiveTask(task ?? null);
	}, []);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			setActiveTask(null);
			const { active, over } = event;
			if (!over) return;

			const taskId = active.id as number;
			const newStatus = over.id as Status;
			const task = tasks.find((t) => t.id === taskId);
			if (!task) return;

			if (task.status === newStatus) return;

			// 楽観更新: UI を即時反映
			setTasks((prev) =>
				prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
			);
			setUpdatingTaskId(taskId);

			try {
				const res = await fetch(`/api/tasks/${taskId}/status`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: newStatus }),
				});

				if (!res.ok) {
					setShowErrorModal(true);
				}
			} catch {
				setShowErrorModal(true);
			} finally {
				setUpdatingTaskId(null);
			}
		},
		[tasks],
	);

	const handleErrorModalOk = () => {
		window.location.reload();
	};

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex gap-4">
					{COLUMNS.map((col) => (
						<DroppableColumn key={col.id} id={col.id} title={col.title}>
							{tasks
								.filter((t) => t.status === col.id)
								.map((task) => (
									<DraggableTaskCard
										key={task.id}
										task={task}
										isUpdating={updatingTaskId === task.id}
									/>
								))}
						</DroppableColumn>
					))}
				</div>
				<DragOverlay>
					{activeTask ? <TaskCard task={activeTask} /> : null}
				</DragOverlay>
			</DndContext>

			<Dialog open={showErrorModal} onOpenChange={() => {}}>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>エラー</DialogTitle>
					</DialogHeader>
					<p className="text-sm">
						更新に失敗しました。最新の状態を取得するため、一覧を再読み込みします。
					</p>
					<div className="flex justify-end pt-2">
						<Button onClick={handleErrorModalOk}>OK</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
