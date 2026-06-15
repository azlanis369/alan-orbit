import { createClient } from "@/lib/supabase/server";
import type { AgentProfileRow, ListingRow } from "@/lib/database.types";

/** Public agent profile by slug, plus their public listings. */
export async function getPublicAgent(slug: string): Promise<{
  profile: AgentProfileRow;
  listings: ListingRow[];
} | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_profile_public", true)
    .maybeSingle();

  if (!profile) return null;

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", (profile as AgentProfileRow).user_id)
    .eq("visibility", "public")
    .is("deleted_at", null)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(48);

  return {
    profile: profile as AgentProfileRow,
    listings: (listings ?? []) as ListingRow[],
  };
}

/** Find the owning agent of a listing (for public contact card). */
export async function getListingAgent(
  userId: string,
): Promise<AgentProfileRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as AgentProfileRow) ?? null;
}
