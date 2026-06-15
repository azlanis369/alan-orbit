import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/lib/constants";
import type { AgentProfileRow, UserRow } from "@/lib/database.types";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  status: UserRow["status"];
  profile: AgentProfileRow | null;
};

/**
 * Resolve the current authenticated user with their app role and profile.
 * Cached per-request. Returns null when not signed in.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appUser } = await supabase
    .from("users")
    .select("id, email, role, status")
    .eq("id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: appUser?.email ?? user.email ?? "",
    role: (appUser?.role as Role) ?? ROLES.AGENT,
    status: appUser?.status ?? "pending",
    profile: profile ?? null,
  };
});

/** Require a signed-in user; redirect to login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status === "deactivated") redirect("/login?error=deactivated");
  return user;
}

/** Require a signed-in user who has completed onboarding. */
export async function requireOnboardedUser(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.profile || !user.profile.full_name) redirect("/onboarding");
  return user;
}

/** Require one of the given roles, otherwise redirect to dashboard. */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

export function isSuperAdmin(role: Role): boolean {
  return role === ROLES.SUPER_ADMIN;
}
