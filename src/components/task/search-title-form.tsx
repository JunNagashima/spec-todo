"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SortField, SortOrder } from "@/schemas/task";

type Props = {
	sortField: SortField;
	sortOrder: SortOrder;
	searchTitle?: string;
};

export function SearchTitleForm({ sortField, sortOrder, searchTitle }: Props) {
	const router = useRouter();
	const [value, setValue] = useState(searchTitle ?? "");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = value.trim();
		const params = new URLSearchParams();
		params.set("sortField", sortField);
		params.set("sortOrder", sortOrder);
		if (trimmed) {
			params.set("searchTitle", trimmed);
		}
		router.replace(`?${params.toString()}`);
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
			<span className="text-sm font-medium text-gray-700 shrink-0">
				タイトル絞り込み:
			</span>
			<Input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="タイトルを入力"
				className="w-48"
			/>
			<Button type="submit" variant="outline" size="sm">
				絞り込み
			</Button>
		</form>
	);
}
