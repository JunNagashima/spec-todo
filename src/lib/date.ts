export function getTodayJST(): string {
	return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
		new Date(),
	);
}

export function isDateTodayOrLater(dateStr: string): boolean {
	const today = getTodayJST();
	return dateStr >= today;
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		timeZone: "Asia/Tokyo",
	}).format(date);
}
