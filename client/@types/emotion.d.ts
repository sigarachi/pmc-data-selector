import "@emotion/react";

type ThemeMode = "light" | "dark";

export interface BreakPoints {
  mobile: string;
  tablet: string;
  laptop: string;
  desktop: string;
}

// export interface Colors {
//   light: Elements;
//   dark: Elements;
// }

export interface Colors {
  bg: Bg;
  stroke: Stroke;
  accent: Accent;
  control: Accent;
  text: Text;
}

export interface Text {
  primary: string;
  secondary: string;
  teritary: string;
  inverted: string;
}

export interface Accent {
  base: string;
  hover: string;
}

export interface Stroke {
  cardBorder: string;
  field: string;
}

export interface Bg {
  base: string;
  primary: string;
}

declare module "@emotion/react" {
  export interface Theme {
    mode: ThemeMode;
    colors: Colors;
    breakPoints: BreakPoints;
    toggleMode: (value?: ThemeMode) => void;
  }
}
