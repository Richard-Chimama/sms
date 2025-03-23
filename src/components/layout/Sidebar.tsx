'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import {
  BookOpen,
  Calendar,
  Home,
  MessageSquare,
  Settings,
  Users,
  Bell,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface CustomSession {
  user: User;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    href: '/students',
    label: 'Students',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    href: '/teachers',
    label: 'Teachers',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    href: '/classes',
    label: 'Classes',
    icon: Calendar,
    roles: ['ADMIN'],
  },
  {
    href: '/admin/fees',
    label: 'Fees Management',
    icon: BookOpen,
    roles: ['ADMIN'],
  },
  {
    href: '/my-classes',
    label: 'My Classes',
    icon: Calendar,
    roles: ['TEACHER'],
  },
  {
    href: '/assignments',
    label: 'Assignments',
    icon: BookOpen,
    roles: ['TEACHER'],
  },
  {
    href: '/exams',
    label: 'Exams',
    icon: BookOpen,
    roles: ['TEACHER'],
  },
  {
    href: '/teacher/materials',
    label: 'Materials',
    icon: FileText,
    roles: ['TEACHER'],
  },
  {
    href: '/my-class',
    label: 'My Class',
    icon: Calendar,
    roles: ['STUDENT'],
  },
  {
    href: '/student-exams',
    label: 'Exams',
    icon: BookOpen,
    roles: ['STUDENT'],
  },
  {
    href: '/materials',
    label: 'Class Materials',
    icon: FileText,
    roles: ['STUDENT'],
  },
  {
    href: '/notices',
    label: 'Notices',
    icon: Bell,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    href: '/chats',
    label: 'Chats',
    icon: MessageSquare,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarOpen } = useStore();

  if (!session?.user) return null;

  const user = session.user as User;
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/80 lg:hidden',
          isSidebarOpen ? 'block' : 'hidden'
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <GraduationCap className="h-8 w-8 text-gray-100" />
        </div>
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-700 text-gray-100'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
} 