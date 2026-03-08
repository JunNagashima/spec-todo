export function getTodayJST(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
    new Date(),
  );
}

export function isDateTodayOrLater(dateStr: string): boolean {
  const today = getTodayJST();
  return dateStr >= today;
}
