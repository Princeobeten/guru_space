import "../globals.css";
import TopNav from "./dashboard/_components/TopNav";
import BottomNav from "./dashboard/_components/BottomNav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><TopNav/>{children} <BottomNav/></body>
    </html>
  );
}
