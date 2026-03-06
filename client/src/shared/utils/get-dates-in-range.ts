export const getDatesInRange = (
	startDate: Date,
	endDate: Date
): Array<Date> => {
	const date = new Date(startDate.getTime());

	const dates: Array<Date> = [];

	while (date <= endDate) {
		dates.push(new Date(date));
		date.setDate(date.getDate() + 1);
	}

	return dates;
};
