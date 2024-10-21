import Link from "next/link";

const Footer = () => {
    return (
      <footer className="bg-navy text-sm text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Guru Space. All rights reserved. | Powered and Devloped by <Link href="#">Guru Devs.</Link></p>
      </footer>
    );
  };
  
  export default Footer;