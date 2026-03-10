"use client";

import { Component, type ReactNode } from "react";
import { toast } from "sonner";

type Props = {
	children: ReactNode;
};

type State = {
	hasError: boolean;
};

export class KanbanBoardErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	componentDidCatch() {
		toast.error("一覧取得に失敗しました", { duration: 5000 });
	}

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex gap-4">
					{["TODO", "DOING", "DONE"].map((status) => (
						<div
							key={status}
							className="flex flex-1 flex-col gap-3 rounded-lg bg-gray-50 p-4"
						>
							<h2 className="text-sm font-semibold text-gray-600">{status}</h2>
						</div>
					))}
				</div>
			);
		}

		return this.props.children;
	}
}
