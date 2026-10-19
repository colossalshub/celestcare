import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AppProvider } from "@/components/providers/AppProvider";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CelestCare",
  description: "A local-first routine planner for the skincare products you already own.",
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("celestcare-theme");
    const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} data-theme="dark" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
