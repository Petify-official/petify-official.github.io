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
      settings: null,
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
      .select("logo_url, hero_pills, brand_title, tagline, whatsapp_number, phone_display, email, location, features, footer_title, footer_legal, coming_soon_title")
      .eq("id", "storefront")
      .maybeSingle(),
  ]);

  if (productsResult.error || sectionsResult.error || settingsResult.error) {
    return {
      products: [],
      sections: [],
      settings: null,
      error: productsResult.error || sectionsResult.error || settingsResult.error,
    };
  }

  const row = settingsResult.data;
  if (!row) {
    return {
      products: productsResult.data.map(mapProduct),
      sections: sectionsResult.data,
      settings: null,
      error: new Error("Storefront settings are missing from Supabase."),
    };
  }

  return {
    products: productsResult.data.map(mapProduct),
    sections: sectionsResult.data,
    settings: {
      brandTitle: row.brand_title,
      tagline: row.tagline,
      logoUrl: row.logo_url ?? "",
      heroPills: row.hero_pills ?? [],
      contact: {
        whatsappNumber: row.whatsapp_number,
        phoneDisplay: row.phone_display,
        email: row.email,
        location: row.location,
      },
      features: row.features ?? [],
      footerTitle: row.footer_title,
      footerLegal: row.footer_legal,
      comingSoonTitle: row.coming_soon_title,
    },
    error: null,
  };
}