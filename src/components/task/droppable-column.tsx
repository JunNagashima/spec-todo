"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type Props = {
	id: string;
	title: string;
	children: ReactNode;
};

export function DroppableColumn({ id, title, children }: Props) {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			className={`flex flex-1 flex-col gap-3 rounded-lg p-4 transition-colors ${
				isOver ? "bg-blue-50 ring-2 ring-blue-300" : "bg-gray-50"
			}`}
		>
			<h2 className="text-sm font-semibold text-gray-600">{title}</h2>
			{children}
		</div>
	);
}
