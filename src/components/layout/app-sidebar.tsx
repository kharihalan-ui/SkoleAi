'use client';

import {
  Home,
  PenSquare,
  Notebook,
  GraduationCap,
  Film,
  Scan,
  Bot,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/essay-checker', label: 'Essay Checker', icon: PenSquare },
  { href: '/notes', label: 'Smart Notes', icon: Notebook },
  { href: '/flashcards', label: 'AI Flashcards', icon: GraduationCap },
  { href: '/video-notes', label: 'Video Notes', icon: Film },
  { href: '/image-analyzer', label: 'Image Analyzer', icon: Scan },
  { href: '/chat', label: 'Chat Assistant', icon: Bot },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BookOpen className="size-6 text-primary" />
          <h1 className="text-xl font-headline font-semibold">ScholarAI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                    className: 'font-headline'
                  }}
                  className="font-headline"
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
