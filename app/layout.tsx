import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Fraunces } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible was designed for readers with low vision. It keeps
// similar letters easy to tell apart, which suits the user demo.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
});

// Fraunces is a warm serif used for headlines and the wordmark.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Entri: a place to begin",
  description:
    "Entri connects people leaving prison, the organizations that help them, and the caseworkers who guide them, in one network for New York City.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
