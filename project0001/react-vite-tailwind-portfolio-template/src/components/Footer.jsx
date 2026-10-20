import { Github, Linkedin, Mail, Facebook, Youtube, Phone } from "lucide-react";
import { memo } from "react";
import { Link } from 'react-router-dom';

// Social links data
const socialLinks = [
  {
    href: "https://www.facebook.com/", // Placeholder
    title: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://www.youtube.com/", // Placeholder
    title: "YouTube",
    icon: Youtube,
  },
  {
    href: "mailto:FarmWithIrene@gmail.com",
    title: "Email",
    icon: Mail,
  },
];

const Footer = memo(() => {
  return (
    <footer className="w-full bg-white dark:bg-neutral-900 border-t border-green-100 dark:border-gray-800 pt-10 pb-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <span className="text-xl font-bold text-green-700 dark:text-green-500">Farm with Irene</span>
          <p className="text-sm text-muted-foreground max-w-xs">
            Empowering farmers with practical knowledge and sustainable practices.
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            © {new Date().getFullYear()} Farm with Irene. All rights reserved.
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-6">
            {socialLinks.map(({ href, title, icon: Icon }) => (
              <a
                key={title}
                href={href}
                title={title}
                aria-label={title}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-green-600 transition-transform duration-200 hover:scale-110"
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            ))}
          </div>
          <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link to="/about" className="hover:text-green-600 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-green-600 transition-colors">Contact</Link>
            {/* <Link to="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link> */}
          </div>
        </div>

      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;