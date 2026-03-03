import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSettings = () => {
	const [searchParams] = useSearchParams();

	const [time, setTime] = useState<string>('');
	const [date, setDate] = useState<string>('');
	const [vmin, setVmin] = useState<string>('');
	const [vmax, setVmax] = useState<string>('');
	const [variable, setVariable] = useState<string>('z');
	const [pressure, setPressure] = useState<string>('850');

	useEffect(() => {
		const searchTime = searchParams.get('time');
		const searchDate = searchParams.get('date');
		const searchVariable = searchParams.get('variable');
		const searchPressure = searchParams.get('pressure');
		const searchVmin = searchParams.get('vmin');
		const searchVmax = searchParams.get('vmax');

		if (searchTime) {
			setTime(searchTime);
		}
		if (searchVmin) {
			setVmin(searchVmin);
		} else {
			setVmin('');
		}
		if (searchVmax) {
			setVmax(searchVmax);
		} else {
			setVmax('');
		}
		if (searchDate) {
			setDate(searchDate);
		}
		if (searchVariable) {
			setVariable(searchVariable);
		}
		if (searchPressure) {
			setPressure(searchPressure);
		}
	}, [searchParams]);

	return {
		time,
		date,
		variable,
		pressure,
		vmax,
		vmin,
	};
};
