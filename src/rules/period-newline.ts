// Insert a line break if there isn't one after "。"
export function applyPeriodNewline(text: string): string {
	return text.replace(/。(?!\n)/g, '。\n');
}
