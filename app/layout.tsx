import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import LanguageButton from "./components/LanguageButton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Milwaukee Domes",
  description: "Rub my Belly HELLO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="header">
          <img
            className="logo"
            src="/main_web_logo.webp"
            alt="Milwaukee Domes"
          />
          <h1>Milwaukee Domes</h1>
          <LanguageButton />
        </div>
        <div className="content-wrapper">{children}</div>
      </body>
    </html>
  );
}
