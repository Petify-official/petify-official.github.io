import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase.js";
import { deleteProduct, getAdminProducts, saveProduct, uploadProductImages } from "./services/admin.js";

const blankProduct = (displayOrder) => ({
  id: "",
  type: "single",
  badge: "Premium Feed",
  title: "",
  description: "",
  specsText: "",
  images: [],
  saveTag: "",
  price: "",
  oldPrice: "",
  defaultWhatsappMsg: "",
  isActive: true,
  displayOrder,
});

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function asEditableProduct(product) {
  return {
    ...product,
    specsText: product.specs.map((spec) => spec.replace(/<[^>]*>/g, "")).join("\n"),
  };
}

function AdminLogin({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    onSignedIn(data.session);
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <p className="admin-eyebrow">PETIFY CATALOG</p>
      <h1>Admin sign in</h1>
      <p className="admin-muted">Sign in with the account you created in Supabase Authentication.</p>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      <a className="admin-back-link" href="/">Back to storefront</a>
    </form>
  );
}

function ProductEditor({ product, onCancel, onSave }) {
  const [form, setForm] = useState(product);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(product.id);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTitle(title) {
    setForm((current) => ({
      ...current,
      title,
      id: current.id || slugify(title),
      defaultWhatsappMsg: current.defaultWhatsappMsg || `Hi Petify, I want to order ${title}`,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const id = form.id || slugify(form.title);
      if (!id) throw new Error("Add a product title to create its product ID.");
      const uploaded = files.length ? await uploadProductImages(id, files) : [];
      await saveProduct({
        ...form,
        id,
        isNew: !isEditing,
        specs: form.specsText.split("\n").map((item) => item.trim()).filter(Boolean),
        images: [...form.images, ...uploaded],
        displayOrder: Number(form.displayOrder) || 0,
      });
      await onSave();
    } catch (saveError) {
      setError(saveError.message || "The product could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="admin-editor-heading">
        <div>
          <p className="admin-eyebrow">{isEditing ? "EDIT PRODUCT" : "NEW PRODUCT"}</p>
          <h2>{isEditing ? form.title : "Add a product"}</h2>
        </div>
        <button className="admin-secondary-button" type="button" onClick={onCancel}>Close</button>
      </div>
      <div className="admin-form-grid">
        <label>Product type
          <select value={form.type} onChange={(event) => update("type", event.target.value)}>
            <option value="single">Single product</option>
            <option value="combo">Combo offer</option>
          </select>
        </label>
        <label>Badge<input value={form.badge} onChange={(event) => update("badge", event.target.value)} required /></label>
        <label className="admin-span-two">Product name<input value={form.title} onChange={(event) => updateTitle(event.target.value)} required /></label>
        {isEditing && <label>Product ID<input value={form.id} readOnly /></label>}
        <label>Display order<input type="number" min="0" step="1" value={form.displayOrder} onChange={(event) => update("displayOrder", event.target.value)} /></label>
        <label className="admin-span-two">Description<textarea rows="3" value={form.description} onChange={(event) => update("description", event.target.value)} required /></label>
        {form.type === "single" ? (
          <label className="admin-span-two">Product details, one per line<textarea rows="4" value={form.specsText} onChange={(event) => update("specsText", event.target.value)} placeholder={"Protein: Min 45%\nNet weight: 125g"} /></label>
        ) : (
          <>
            <label>Offer tag<input value={form.saveTag} onChange={(event) => update("saveTag", event.target.value)} placeholder="SAVE ₹65" /></label>
            <label>Price<input value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="₹599" /></label>
            <label>Previous price<input value={form.oldPrice} onChange={(event) => update("oldPrice", event.target.value)} placeholder="₹664" /></label>
          </>
        )}
        <label className="admin-span-two">WhatsApp order message<input value={form.defaultWhatsappMsg} onChange={(event) => update("defaultWhatsappMsg", event.target.value)} required /></label>
        <label className="admin-span-two">Product photos<input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /><span className="admin-field-hint">New photos upload when you save. Existing photos stay unless removed below.</span></label>
        {form.images.length > 0 && (
          <div className="admin-image-list admin-span-two">
            {form.images.map((image, index) => (
              <div className="admin-image-item" key={`${image}-${index}`}>
                <img src={image} alt={`${form.title} ${index + 1}`} />
                <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => update("images", form.images.filter((_, imageIndex) => imageIndex !== index))}>Remove</button>
              </div>
            ))}
          </div>
        )}
        <label className="admin-checkbox admin-span-two"><input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} /> Visible in the storefront</label>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-form-actions">
        <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Saving product..." : "Save product"}</button>
        <button className="admin-secondary-button" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ProductManager({ session }) {
  const [products, setProducts] = useState([]);
  const [editorProduct, setEditorProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshProducts() {
    setError("");
    try {
      setProducts(await getAdminProducts());
    } catch (loadError) {
      setError(loadError.message || "Products could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshProducts(); }, []);

  async function removeProduct(product) {
    if (!window.confirm(`Delete ${product.title}? This cannot be undone.`)) return;
    try {
      await deleteProduct(product);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setError("");
    } catch (deleteError) {
      setError(deleteError.message || "The product could not be deleted.");
      await refreshProducts();
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/">Pëtify <span>CATALOG</span></a>
        <div className="admin-user"><span>{session.user.email}</span><button onClick={signOut}>Sign out</button></div>
      </header>
      <main className="admin-content">
        {editorProduct ? (
          <ProductEditor
            key={editorProduct.id || "new"}
            product={editorProduct}
            onCancel={() => setEditorProduct(null)}
            onSave={async () => { await refreshProducts(); setEditorProduct(null); }}
          />
        ) : (
          <>
            <div className="admin-page-heading">
              <div><p className="admin-eyebrow">STORE MANAGEMENT</p><h1>Products</h1><p className="admin-muted">Manage the catalog shown on your storefront.</p></div>
              <button className="admin-primary-button" onClick={() => setEditorProduct(blankProduct(products.length + 1))}>Add product</button>
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
            {loading ? <p className="admin-muted">Loading products...</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Type</th><th>Price</th><th>Visibility</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td><div className="admin-product-cell"><img src={product.images[0] || "/images/logo.png"} alt="" /><div><strong>{product.title}</strong><span>{product.id}</span></div></div></td>
                        <td>{product.type === "combo" ? "Combo" : "Single"}</td>
                        <td>{product.price || "—"}</td>
                        <td><span className={`admin-status${product.isActive ? " is-active" : ""}`}>{product.isActive ? "Visible" : "Hidden"}</span></td>
                        <td><div className="admin-row-actions"><button onClick={() => setEditorProduct(asEditableProduct(product))}>Edit</button><button className="admin-delete-button" onClick={() => removeProduct(product)}>Delete</button></div></td>
                      </tr>
                    ))}
                    {!products.length && <tr><td colSpan="5" className="admin-empty">No products yet. Add your first product to begin.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data, error }) => {
      setSession(data.session);
      setSetupError(error?.message ?? "");
      setCheckingSession(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    async function checkRole() {
      if (!session || !supabase) {
        setIsAdmin(false);
        return;
      }
      setCheckingRole(true);
      setSetupError("");
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!active) return;
      setIsAdmin(Boolean(data));
      setSetupError(error?.message ?? "");
      setCheckingRole(false);
    }
    checkRole();
    return () => { active = false; };
  }, [session]);

  if (!supabase) {
    return <div className="admin-gate"><div><p className="admin-eyebrow">SUPABASE SETUP</p><h1>Connect your project first</h1><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart Vite.</p><a href="/">Back to storefront</a></div></div>;
  }

  if (checkingSession || checkingRole) {
    return <div className="admin-gate"><p className="admin-muted">Checking admin access...</p></div>;
  }

  if (!session) return <AdminLogin onSignedIn={setSession} />;

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <div><p className="admin-eyebrow">ACCESS NOT ASSIGNED</p><h1>Your account is not an admin yet</h1><p>In Supabase, copy this user ID from Authentication → Users, then insert it into <code>public.admin_users</code> from the SQL Editor.</p><code className="admin-user-id">{session.user.id}</code>{setupError && <p className="admin-error">{setupError}</p>}<p className="admin-gate-actions"><button className="admin-secondary-button" onClick={() => window.location.reload()}>Check again</button><button className="admin-secondary-button" onClick={() => supabase.auth.signOut()}>Sign out</button></p></div>
      </div>
    );
  }

  return <ProductManager session={session} />;
}