import { siteData } from "../data/catalog.js";
import { supabase } from "../lib/supabase.js";

function mapProduct(row) {
  return {
    id: row.id,
    type: row.type,
    sectionId: row.section_id,
    badge: row.badge,
    title: row.title,
    description: row.description,
    specs: row.specs ?? [],
    images: row.images ?? [],
    saveTag: row.save_tag,
    price: row.price,
    oldPrice: row.old_price,
    defaultWhatsappMsg: row.default_whatsapp_msg,
  };
}

export async function getCatalog() {
  if (!supabase) {
    return {
      products: [],
      sections: [],
      logoUrl: "",
      heroPills: [],
      source: "supabase",
      error: new Error("Supabase is not configured."),
    };
  }

  const [productsResult, sectionsResult, settingsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("catalog_sections")
      .select("id, title, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("logo_url, hero_pills")
      .eq("id", "storefront")
      .maybeSingle(),
  ]);

  if (productsResult.error || sectionsResult.error) {
    return {
      products: [],
      sections: [],
      logoUrl: settingsResult.data?.logo_url ?? "",
      heroPills: [],
      source: "supabase",
      error: productsResult.error || sectionsResult.error,
    };
  }

  return {
    products: productsResult.data.map(mapProduct),
    sections: sectionsResult.data,
    logoUrl: settingsResult.data?.logo_url ?? "",
    heroPills: settingsResult.data?.hero_pills ?? [],
    source: "supabase",
    error: settingsResult.error,
  };
}