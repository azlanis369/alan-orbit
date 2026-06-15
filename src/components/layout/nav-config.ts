import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Handshake,
  UserRound,
  BarChart3,
  ShieldCheck,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROLES, type Role } from "@/lib/constants";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // omitted = all roles
};

const ALL: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AGENT];

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL },
  { label: "Listings", href: "/listings", icon: Building2, roles: ALL },
  { label: "Add Listing", href: "/listings/new", icon: PlusCircle, roles: ALL },
  { label: "Deals", href: "/deals", icon: Handshake, roles: ALL },
  { label: "Leads", href: "/leads", icon: Users, roles: ALL },
  { label: "My Profile", href: "/profile", icon: UserRound, roles: ALL },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ALL },
  {
    label: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  { label: "Settings", href: "/settings", icon: Settings, roles: ALL },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Listings", href: "/listings", icon: Building2 },
  { label: "Add", href: "/listings/new", icon: PlusCircle },
  { label: "Deals", href: "/deals", icon: Handshake },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function visibleNav(items: NavItem[], role: Role): NavItem[] {
  return items.filter((i) => !i.roles || i.roles.includes(role));
}
