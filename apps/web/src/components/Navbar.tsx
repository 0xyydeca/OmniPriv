'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectWallet from './ConnectWallet';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#demo', label: 'Demo' },
    { href: '/#about', label: 'About' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            aria-label="OmniPriv Home"
          >
            OmniPriv
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Navigation Links */}
            <ul className="hidden sm:flex items-center gap-4 sm:gap-6" role="list">
              {navLinks.map((link) => (
                <li key={link.href} role="listitem">
                  <Link
                    href={link.href}
                    className={`text-sm sm:text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1 ${
                      isActive(link.href)
                        ? 'text-primary-400'
                        : 'text-gray-300 hover:text-primary-400'
                    }`}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Connect Wallet Button */}
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}

