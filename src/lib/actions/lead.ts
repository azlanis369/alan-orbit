"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations/lead";
import type { LeadStatus } from "@/lib/constants";

export type LeadActionResult = { ok: true; id: string } | { ok: false; error: string };

/** Create a lead owned by the current user. */
export async function createLead(input: unknown): Promise<LeadActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Tidak dibenarkan." };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Data tidak sah." };
  }
  const v = parsed.data;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      agent_id: user.id,
      listing_id: v.listing_id || null,
      name: v.name,
      phone: v.phone,
      email: v.email || null,
      source: v.source,
      budget: v.budget || null,
      preferred_area: v.preferred_area || null,
      notes: v.notes || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !lead) {
    return { ok: false, error: "Gagal menyimpan lead. Cuba lagi." };
  }

  revalidatePath("/leads");
  return { ok: true, id: lead.id };
}

/** Update only the status of a lead (owner/admin via RLS). */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Tidak dibenarkan." };
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: "Gagal mengemas kini status." };

  revalidatePath("/leads");
  return { ok: true };
}
