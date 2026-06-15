"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { listingSchema } from "@/lib/validations/listing";
import { uniqueSlug } from "@/lib/utils";
import type { ListingStatus } from "@/lib/constants";

export type ListingActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

type MediaInput = {
  url: string;
  thumbnail_url?: string | null;
  media_type?: "image" | "video";
  caption?: string | null;
  file_size?: number | null;
};

function detailPayload(category: string, values: Record<string, unknown>) {
  if (category === "project") return { table: "listing_project_details", data: values.project };
  if (category === "subsale") return { table: "listing_subsale_details", data: values.subsale };
  if (category === "rental") return { table: "listing_rental_details", data: values.rental };
  return null;
}

/** Create a listing (with category detail + media) owned by the current user. */
export async function createListing(
  input: unknown,
  media: MediaInput[] = [],
): Promise<ListingActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Tidak dibenarkan." };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Data tidak sah." };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const slug = uniqueSlug(v.title);
  const heroFromMedia = media.find((m) => m.media_type !== "video")?.url ?? null;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      agent_id: user.id,
      category: v.category,
      title: v.title,
      slug,
      property_type: v.property_type,
      area: v.area,
      address_private: v.address_private || null,
      address_public: v.address_public || null,
      show_exact_address: v.show_exact_address,
      map_url: v.map_url || null,
      price: v.price ?? null,
      price_display: v.price_display || null,
      tenure: v.tenure ?? null,
      built_up_sqft: v.built_up_sqft ?? null,
      land_area_sqft: v.land_area_sqft ?? null,
      bedrooms: v.bedrooms ?? null,
      bathrooms: v.bathrooms ?? null,
      carparks: v.carparks ?? null,
      furnishing: v.furnishing ?? null,
      description: v.description || null,
      top_selling_points: v.top_selling_points,
      facilities: v.facilities,
      amenities: v.amenities,
      nearby: v.nearby,
      tags: v.tags,
      status: v.status,
      visibility: v.visibility,
      featured: v.featured,
      show_agent_phone: v.show_agent_phone,
      enable_whatsapp_cta: v.enable_whatsapp_cta,
      enable_telegram_share: v.enable_telegram_share,
      internal_notes: v.internal_notes || null,
      hero_image_url: heroFromMedia,
      published_at: v.status !== "draft" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error || !listing) {
    return { ok: false, error: "Gagal mencipta listing. Cuba lagi." };
  }

  // Category detail row
  const detail = detailPayload(v.category, v);
  if (detail?.data) {
    await supabase
      .from(detail.table)
      .insert({ listing_id: listing.id, ...(detail.data as object) });
  }

  // Media rows
  if (media.length) {
    await supabase.from("listing_media").insert(
      media.map((m, i) => ({
        listing_id: listing.id,
        media_type: m.media_type ?? "image",
        url: m.url,
        thumbnail_url: m.thumbnail_url ?? null,
        caption: m.caption ?? null,
        sort_order: i,
        file_size: m.file_size ?? null,
      })),
    );
  }

  await supabase.from("listing_status_history").insert({
    listing_id: listing.id,
    old_status: null,
    new_status: v.status,
    changed_by: user.id,
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  return { ok: true, id: listing.id, slug: listing.slug };
}

/** Update an existing listing (owner/admin via RLS). */
export async function updateListing(
  id: string,
  input: unknown,
  media: MediaInput[] | null = null,
): Promise<ListingActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Tidak dibenarkan." };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Data tidak sah." };
  }
  const v = parsed.data;
  const supabase = await createClient();

  const heroFromMedia = media?.find((m) => m.media_type !== "video")?.url;

  const { data: listing, error } = await supabase
    .from("listings")
    .update({
      category: v.category,
      title: v.title,
      property_type: v.property_type,
      area: v.area,
      address_private: v.address_private || null,
      address_public: v.address_public || null,
      show_exact_address: v.show_exact_address,
      map_url: v.map_url || null,
      price: v.price ?? null,
      price_display: v.price_display || null,
      tenure: v.tenure ?? null,
      built_up_sqft: v.built_up_sqft ?? null,
      land_area_sqft: v.land_area_sqft ?? null,
      bedrooms: v.bedrooms ?? null,
      bathrooms: v.bathrooms ?? null,
      carparks: v.carparks ?? null,
      furnishing: v.furnishing ?? null,
      description: v.description || null,
      top_selling_points: v.top_selling_points,
      facilities: v.facilities,
      amenities: v.amenities,
      nearby: v.nearby,
      tags: v.tags,
      status: v.status,
      visibility: v.visibility,
      featured: v.featured,
      show_agent_phone: v.show_agent_phone,
      enable_whatsapp_cta: v.enable_whatsapp_cta,
      enable_telegram_share: v.enable_telegram_share,
      internal_notes: v.internal_notes || null,
      ...(heroFromMedia ? { hero_image_url: heroFromMedia } : {}),
    })
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error || !listing) {
    return { ok: false, error: "Gagal mengemas kini listing." };
  }

  const detail = detailPayload(v.category, v);
  if (detail?.data) {
    await supabase
      .from(detail.table)
      .upsert(
        { listing_id: id, ...(detail.data as object) },
        { onConflict: "listing_id" },
      );
  }

  if (media) {
    await supabase.from("listing_media").delete().eq("listing_id", id);
    if (media.length) {
      await supabase.from("listing_media").insert(
        media.map((m, i) => ({
          listing_id: id,
          media_type: m.media_type ?? "image",
          url: m.url,
          thumbnail_url: m.thumbnail_url ?? null,
          caption: m.caption ?? null,
          sort_order: i,
          file_size: m.file_size ?? null,
        })),
      );
    }
  }

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, id: listing.id, slug: listing.slug };
}

/** Change only the status of a listing and log it. */
export async function updateListingStatus(
  id: string,
  status: ListingStatus,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Tidak dibenarkan." };
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("listings")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("listings")
    .update({
      status,
      ...(status !== "draft" ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) return { ok: false, error: "Gagal mengemas kini status." };

  await supabase.from("listing_status_history").insert({
    listing_id: id,
    old_status: current?.status ?? null,
    new_status: status,
    changed_by: user.id,
  });

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  return { ok: true };
}

/** Soft-delete a listing. */
export async function deleteListing(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Tidak dibenarkan." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: "Gagal memadam listing." };
  revalidatePath("/listings");
  return { ok: true };
}
