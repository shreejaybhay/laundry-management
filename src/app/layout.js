import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Laundry Management",
  description: "A modern laundry management system",
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
