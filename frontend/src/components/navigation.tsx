/**
 * Main Navigation Component
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/planner', label: 'Planner' },
    { href: '/compare', label: 'Compare' },
    { href: '/methodology', label: 'Methodology' },
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <h1 className="text-xl font-bold text-blue-900 whitespace-nowrap">WorthWise</h1>
            <span className="text-sm text-zinc-500 whitespace-nowrap hidden sm:inline">College ROI Planner</span>
          </Link>
          
          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-blue-900 border-b-2 border-blue-900'
                    : 'text-zinc-600 hover:text-zinc-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

