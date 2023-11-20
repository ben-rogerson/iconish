import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iconish",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="dark">{children}</body>
    </html>
  );
}
