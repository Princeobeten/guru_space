import type { Metadata } from "next";
import "../globals.css";
import TopNav from "./_components/TopNav";
import BottomNav from "./_components/BottomNav";

export const metadata: Metadata = {
  title: "Guru Space",
  description: "Guru Space",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <TopNav/>
      <body>{children}</body>
      <BottomNav/>
    </html>
  );
}
