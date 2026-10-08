"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zyka_theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      if (saved === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    } else {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("zyka_theme", nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    window.dispatchEvent(new CustomEvent("zyka-theme-changed", { detail: { theme: nextTheme } }));
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#18241c] border border-[#2d4734]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl bg-[#18241c] text-[#98c9a3] hover:text-[#f3efe6] hover:bg-[#1f3025] transition-all border border-[#2d4734] hover:border-[#98c9a3]/40 flex items-center gap-1.5 text-xs font-semibold shrink-0 shadow-sm"
      title={theme === "dark" ? "สลับเป็นโหมดสว่าง (Light Mode)" : "สลับเป็นโหมดมืด (Dark Mode)"}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline text-amber-300">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600" />
          <span className="hidden lg:inline text-indigo-700">Dark</span>
        </>
      )}
    </button>
  );
}
