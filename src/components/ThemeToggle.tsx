import React, { useState, useEffect } from "react";
import { Switch } from "./ui/switch";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  initialTheme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const ThemeToggle = ({
  initialTheme = "light",
  onThemeChange,
}: ThemeToggleProps) => {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  useEffect(() => {
    // Apply theme to document when component mounts or theme changes
    document.documentElement.classList.toggle("dark", theme === "dark");

    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [theme, onThemeChange]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg",
        "transition-colors duration-200",
        theme === "dark" ? "bg-gray-800" : "bg-white",
      )}
    >
      <Sun
        size={18}
        className={cn(
          "text-muted-foreground transition-colors",
          theme === "light" && "text-amber-500",
        )}
      />

      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />

      <Moon
        size={18}
        className={cn(
          "text-muted-foreground transition-colors",
          theme === "dark" && "text-indigo-400",
        )}
      />
    </div>
  );
};

export default ThemeToggle;
