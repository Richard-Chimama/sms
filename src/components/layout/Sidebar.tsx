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
  { href: '/attendance', label: 'Attendance' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/exams', label: 'Exams' },
  { href: '/duty-log', label: 'Duty Log' },
];

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/my-classes', label: 'My Classes' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/exams', label: 'Exams' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/fees', label: 'Fees' },
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
    <nav className="w-64 bg-white shadow-lg h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">School MS</h2>
        <p className="text-sm text-gray-600">{session.user.name}</p>
      </div>
      <ul className="space-y-2 p-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-blue-50'
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