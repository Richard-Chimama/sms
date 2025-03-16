import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  ScrollText,
  Bell,
} from "lucide-react";

const teacherLinks = [
  {
    name: "Dashboard",
    href: "/teacher-dashboard",
    icon: Home,
  },
  {
    name: "My Classes",
    href: "/my-classes",
    icon: GraduationCap,
  },
  {
    name: "Assignments",
    href: "/assignments",
    icon: ScrollText,
  },
  {
    name: "Notices",
    href: "/notices",
    icon: Bell,
  },
  {
    name: "Timetable",
    href: "/timetable",
    icon: Calendar,
  },
  {
    name: "Subjects",
    href: "/subjects",
    icon: BookOpen,
  },
];

export default function TeacherNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {teacherLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === link.href ? "bg-accent" : "transparent"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
} 