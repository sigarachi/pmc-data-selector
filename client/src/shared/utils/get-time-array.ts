export const getTimeArray = (): Array<string> => {
	const time = new Array(24).fill(null).map((_, i) => `${i}:00`);

	return time;
};
