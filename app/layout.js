import Link from 'next/link';
import { ThemeProvider } from 'next-themes';
import { LayoutDashboard, Search, BookOpen, Rocket, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import './globals.css';

const NAV_ITEMS = [
  { href: '/board', label: 'Board', Icon: LayoutDashboard },
  { href: '/inspect', label: 'Inspect', Icon: Search },
  { href: '/library', label: 'Library', Icon: BookOpen },
  { href: '/implement', label: 'Implement', Icon: Rocket },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export const metadata = {
  title: 'AddBrain CORE Dashboard',
  description: 'WhatsApp-based personal knowledge management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <aside className="w-60 flex-shrink-0 bg-slate-900 dark:bg-slate-950 flex flex-col">
              <div className="px-6 py-5 border-b border-slate-800">
                <span className="text-white font-bold text-lg tracking-tight">
                  🧠 AddBrain
                </span>
                <p className="text-slate-400 text-xs mt-0.5">CORE Dashboard</p>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm"
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="px-6 py-4 border-t border-slate-800">
                <p className="text-slate-400 text-xs">Demo User</p>
                <p className="text-slate-500 text-xs">+91 9995554710</p>
              </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
              <div className="p-6">{children}</div>
            </main>
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
