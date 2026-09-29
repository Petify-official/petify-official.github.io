import { siteData } from "../data/catalog.js";
import { supabase } from "../lib/supabase.js";

function mapProduct(row) {
  return {
    id: row.id,
    type: row.type,
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
    return { products: siteData.products, source: "local", error: null };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return { products: siteData.products, source: "local", error };
  }

  return {
    products: data.length ? data.map(mapProduct) : siteData.products,
    source: data.length ? "supabase" : "local",
    error: null,
  };
}