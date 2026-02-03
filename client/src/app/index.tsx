import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "./router";
import { ThemeProvider } from "@university-ecosystem/ui-kit";

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

function App() {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
