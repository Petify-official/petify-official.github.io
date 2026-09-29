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

export async function uploadProductImages(productId, files) {
  const uploadedUrls = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${productId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(imageBucket).upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    uploadedUrls.push(supabase.storage.from(imageBucket).getPublicUrl(filePath).data.publicUrl);
  }

  return uploadedUrls;
}

export async function saveProduct(product) {
  const row = {
    id: product.id,
    type: product.type,
    badge: product.badge,
    title: product.title,
    description: product.description,
    specs: product.specs,
    images: product.images,
    save_tag: product.type === "combo" ? product.saveTag : null,
    price: product.type === "combo" ? product.price : null,
    old_price: product.type === "combo" ? product.oldPrice : null,
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