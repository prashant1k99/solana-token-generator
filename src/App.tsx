import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { ThemeProvider } from "./hooks/theme-provider";

function App() {

  return (
    <ThemeProvider>
      <ThemeSwitcher />
      Hello World
    </ThemeProvider>
  )
}

export default App
