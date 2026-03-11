"use client";

import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SortField, SortOrder } from "@/schemas/task";

const SORT_FIELDS: { value: SortField; label: string }[] = [
	{ value: "createdAt", label: "登録日" },
	{ value: "dueDate", label: "期限" },
	{ value: "title", label: "タイトル" },
];

const SORT_ORDERS: { value: SortOrder; label: string }[] = [
	{ value: "asc", label: "昇順" },
	{ value: "desc", label: "降順" },
];

type Props = {
	sortField: SortField;
	sortOrder: SortOrder;
};

export function SortControl({ sortField, sortOrder }: Props) {
	const router = useRouter();

	function updateField(field: SortField) {
		router.replace(`?sortField=${field}&sortOrder=${sortOrder}`);
	}

	function updateOrder(order: SortOrder) {
		router.replace(`?sortField=${sortField}&sortOrder=${order}`);
	}

	return (
		<div className="flex items-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg">
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-gray-700">ソート項目:</span>
				<RadioGroup
					value={sortField}
					onValueChange={(v) => updateField(v as SortField)}
					className="flex gap-3"
				>
					{SORT_FIELDS.map((f) => (
						<div key={f.value} className="flex items-center gap-1">
							<RadioGroupItem value={f.value} id={`field-${f.value}`} />
							<label htmlFor={`field-${f.value}`} className="cursor-pointer text-sm">
								{f.label}
							</label>
						</div>
					))}
				</RadioGroup>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-gray-700">順番:</span>
				<RadioGroup
					value={sortOrder}
					onValueChange={(v) => updateOrder(v as SortOrder)}
					className="flex gap-3"
				>
					{SORT_ORDERS.map((o) => (
						<div key={o.value} className="flex items-center gap-1">
							<RadioGroupItem value={o.value} id={`order-${o.value}`} />
							<label htmlFor={`order-${o.value}`} className="cursor-pointer text-sm">
								{o.label}
							</label>
						</div>
					))}
				</RadioGroup>
			</div>
		</div>
	);
}
