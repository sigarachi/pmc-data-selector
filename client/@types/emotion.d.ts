import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      primary: Record<string | number, string>;
      secondary: Record<string | number, string>;
      tertiary: Record<string | number, string>;
      quaternary: Record<string | number, string>;
      grey: Record<string | number, string>;
      contrast: Record<string | number, string>;
      error: Record<string | number, string>;
    };
    breakPoints: {
      mobile: string;
      tablet: string;
      laptop: string;
      desktop: string;
    };
    br: {
      base: string;
      round: string;
    };
  }
}
