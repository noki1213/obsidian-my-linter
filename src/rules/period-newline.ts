// Insert a line break after a Japanese full stop when one is missing
export function applyPeriodNewline(text: string): string {
	return text.replace(/。(?!\n)/g, '。\n');
}
