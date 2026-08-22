import GameCanvas from "@/components/GameCanvas";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

/** Luminous Connectome Lab: a deliberately dark React frame around a sole Babylon simulation canvas. */

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <GameCanvas />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
