export interface LegendRequest {
	variable: string;
	pressure: number;
	time: string;
	vmin?: string;
	vmax?: string;
}

export interface Legend {
	vmin: number;
	vmax: number;
	bins: Array<number>;
	colors: Array<string>;
	unit: string;
}
