import type { editor } from "monaco-editor";
import { useState, useEffect } from 'react';


export const editorOptions: editor.IEditorOptions = {
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  formatOnPaste: true,
  wordWrap: "on",
  padding: {
    top: 8,
  },
  readOnly: false, // Make editable by default
};



type Theme = "light" | "vs-dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "vs-dark" : "light");
      
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? "vs-dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  return { theme, setTheme };
};