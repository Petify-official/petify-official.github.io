import { supabase } from "../lib/supabase.js";

const imageBucket = "product-images";

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    sectionId: row.section_id,
    badge: row.badge,
    title: row.title,
    description: row.description,
    specs: row.specs ?? [],
    images: row.images ?? [],
    saveTag: row.save_tag ?? "",
    price: row.price ?? "",
    oldPrice: row.old_price ?? "",
    defaultWhatsappMsg: row.default_whatsapp_msg,
    isActive: row.is_active,
    displayOrder: row.display_order,
  }));
}

export async function getAdminSections() {
  const { data, error } = await supabase
    .from("catalog_sections")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;

  return data;
}

export async function getStoreLogo() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("logo_url")
    .eq("id", "storefront")
    .maybeSingle();
  if (error) throw error;

  return data?.logo_url ?? "";
}

export async function getHeroPills() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_pills")
    .eq("id", "storefront")
    .maybeSingle();
  if (error) throw error;

  return data?.hero_pills ?? [];
}

export async function saveHeroPills(heroPills) {
  const { error } = await supabase
    .from("site_settings")
    .update({ hero_pills: heroPills, updated_at: new Date().toISOString() })
    .eq("id", "storefront");
  if (error) throw error;
}

export async function createCatalogSection(section) {
  const { error } = await supabase.from("catalog_sections").insert({
    id: section.id,
    title: section.title,
    display_order: section.displayOrder,
  });
  if (error) throw error;
}

export async function renameCatalogSection(sectionId, title) {
  const { error } = await supabase
    .from("catalog_sections")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", sectionId);
  if (error) throw error;
}

export async function deleteCatalogSection(sectionId) {
  const { error } = await supabase.from("catalog_sections").delete().eq("id", sectionId);
  if (error) throw error;
}

export async function saveCatalogSectionOrder(sections) {
  const results = await Promise.all(sections.map((section, index) =>
    supabase
      .from("catalog_sections")
      .update({ display_order: index + 1 })
      .eq("id", section.id)
  ));
  const failedUpdate = results.find((result) => result.error);
  if (failedUpdate) throw failedUpdate.error;
}

export async function updateStoreLogo(file) {
  const [logoUrl] = await uploadProductImages("store-settings", [file]);
  const { error } = await supabase
    .from("site_settings")
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq("id", "storefront");
  if (error) throw error;

  return logoUrl;
}

export async function uploadProductImages(productId, files, onProgress) {
  const uploadedUrls = [];

  for (const [index, file] of files.entries()) {
    onProgress?.({ completed: index, total: files.length, fileName: file.name });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${productId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(imageBucket).upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error?.message === "Bucket not found") {
      throw new Error(`The Supabase Storage bucket "${imageBucket}" is missing. Run supabase/admin.sql in the Supabase SQL Editor, then try again.`);
    }
    if (error) throw error;

    uploadedUrls.push(supabase.storage.from(imageBucket).getPublicUrl(filePath).data.publicUrl);
    onProgress?.({ completed: index + 1, total: files.length, fileName: "" });
  }

  return uploadedUrls;
}

export async function saveProduct(product) {
  const row = {
    id: product.id,
    type: product.type,
    section_id: product.sectionId,
    badge: product.badge,
    title: product.title,
    description: product.description,
    specs: product.specs,
    images: product.images,
    save_tag: product.type === "combo" ? product.saveTag : null,
    price: product.price || null,
    old_price: product.oldPrice || null,
    default_whatsapp_msg: product.defaultWhatsappMsg,
    is_active: product.isActive,
    display_order: product.displayOrder,
    updated_at: new Date().toISOString(),
  };

  const query = product.isNew
    ? supabase.from("products").insert(row)
    : supabase.from("products").update(row).eq("id", row.id);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteProduct(product) {
  const { error } = await supabase.from("products").delete().eq("id", product.id);
  if (error) throw error;

  const storagePrefix = `/storage/v1/object/public/${imageBucket}/`;
  const paths = product.images
    .filter((url) => url.includes(storagePrefix))
    .map((url) => url.split(storagePrefix)[1]);

  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(imageBucket).remove(paths);
    if (storageError) throw storageError;
  }
}