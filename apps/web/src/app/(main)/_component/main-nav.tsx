'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/compare', label: '비교', icon: Scale },
  { href: '/admin', label: '관리', icon: Shield },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-2 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-xl grid-cols-2 gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-medium transition',
                  active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
