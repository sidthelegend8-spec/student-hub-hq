import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>("studyhub-theme", "dark");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
