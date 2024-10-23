import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: [ "100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "Guru Space",
  description: "Guru Space - Co-working space in calabar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}><Navbar/>{children} <Footer/></body>
    </html>
  );
}
