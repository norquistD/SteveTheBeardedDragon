import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import IntlProvider from "./components/IntlProvider";
import PlantProvider from "./components/PlantProvider";
import LayoutContent from "./components/LayoutContent";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Steve Stories",
  description: "Explore the domes yourself!",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Steve Stories",
    description: "Explore the domes yourself!",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "Steve Stories",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steve Stories",
    description: "Explore the domes yourself!",
    images: ["/favicon.png"],
  },
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
          <PlantProvider>
            <LayoutContent>{children}</LayoutContent>
          </PlantProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
