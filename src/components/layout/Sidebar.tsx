'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/classes', label: 'Classes' },
  { href: '/notices', label: 'Notices' },
  { href: '/fees', label: 'Fees' },
  { href: '/settings', label: 'Settings' },
];

const teacherLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/my-classes', label: 'My Classes' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/exams', label: 'Exams' },
];

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/my-class', label: 'My Class' },
  { href: '/student-exams', label: 'Exams' },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const links = session.user.role === 'ADMIN'
    ? adminLinks
    : session.user.role === 'TEACHER'
    ? teacherLinks
    : studentLinks;

  return (
    <nav className="w-64 bg-gray-800 shadow-lg h-screen border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-100">School MS</h2>
        <p className="text-sm text-gray-400">{session.user.name}</p>
      </div>
      <ul className="space-y-2 p-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-blue-600 text-gray-100'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 