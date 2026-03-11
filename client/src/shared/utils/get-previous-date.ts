export function getPreviousDay(date = new Date()) {
	const previous = new Date(date.getTime());
	previous.setDate(date.getDate() - 1);

	return previous;
}

export function getNextDay(date = new Date()) {
	const previous = new Date(date.getTime());
	previous.setDate(date.getDate() + 1);

	return previous;
}
