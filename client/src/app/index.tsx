import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "./router";
import { ThemeProvider, ecosystemTheme } from "@university-ecosystem/ui-kit";
import type { Theme } from "@emotion/react";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: Infinity,
      staleTime: Infinity,
      refetchOnMount: false,
      retry: false,
    },
  },
});

const theme: Theme = {
  ...ecosystemTheme,
  colors: {
    primary: {
      base: "#003ef8",
      100: "#f0f5ff",
      200: "#c7d6ff",
      300: "#9db6ff",
      400: "#3a6bff",
      500: "#0d4aff",
      600: "#0026b7",
      700: "#001064",
    },
    secondary: {
      base: "#1f5dff",
      100: "#ebf0ff",
      200: "#c1d1ff",
      300: "#96b1ff",
      400: "#6c90ff",
      500: "#1f5dff",
      600: "#0033b2",
      700: "#00195d",
    },
    tertiary: {
      base: "#8db3ff",
      100: "#e0ebff",
      200: "#8db3ff",
      300: "#5d92ff",
      400: "#2d70ff",
      500: "#0047dc",
      600: "#002a88",
      700: "#001444",
    },
    quaternary: {
      base: "#00b5e6",
      100: "#baefff",
      200: "#00b5e6",
      300: "#0092ba",
      400: "#007191",
      500: "#005163",
      600: "#003340",
      700: "#001821",
    },
    grey: {
      base: "#7e7e85",
      100: "#f1f1f1",
      200: "#cacacd",
      300: "#a3a3a8",
      400: "#7e7e85",
      500: "#5b5b63",
      600: "#3a3a40",
      700: "#1b1b1f",
    },
    contrast: {
      base: "#4F9CFF",
      300: "#7BB8FF",
      700: "#1A5A89",
    },
    error: {
      base: "#eb5757",
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
