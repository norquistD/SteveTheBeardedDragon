import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import IntlProvider from "./components/IntlProvider";
import LayoutContent from "./components/LayoutContent";

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
        <IntlProvider>
          <LayoutContent>{children}</LayoutContent>
        </IntlProvider>
      </body>
    </html>
  );
}
