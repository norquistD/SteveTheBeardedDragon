import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steve The Bearded Dragon",
  description: "Rub my Belly HELLO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="header">
          <img className="logo" src="/bearded.png" alt="Bearded Dragon" />
          <h1>hello</h1>
        </div>
        {children}
      </body>
    </html>
  );
}
