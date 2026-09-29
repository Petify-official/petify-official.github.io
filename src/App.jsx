import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard.jsx";
import { siteData } from "./data/catalog.js";
import { getCatalog } from "./services/catalog.js";

const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='16' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductGallery({ product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = product.images?.length ? product.images : [placeholderImage];
  const changeImage = (direction) => {
    setActiveIndex((index) => (index + direction + images.length) % images.length);
  };

  return (
    <div className="card-gallery">
      <div className="carousel-images">
        {images.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${product.title} photo ${index + 1}`}
            className={`card-main-image${index === activeIndex ? " active" : ""}`}
            onError={(event) => { event.currentTarget.src = placeholderImage; }}
          />
        ))}
        {images.length > 1 && (
          <>
            <button className="carousel-btn prev" onClick={() => changeImage(-1)} aria-label="Previous photo">&#10094;</button>
            <button className="carousel-btn next" onClick={() => changeImage(1)} aria-label="Next photo">&#10095;</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="dots" aria-label={`Photo ${activeIndex + 1} of ${images.length}`}>
          {images.map((image, index) => (
            <span key={`${image}-dot-${index}`} className={`dot${index === activeIndex ? " active" : ""}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderLink({ product, combo = false }) {
  const link = `https://wa.me/${siteData.contact.whatsappNumber}?text=${encodeURIComponent(product.defaultWhatsappMsg)}`;
  return <a href={link} className="btn" target="_blank" rel="noopener noreferrer">{combo ? "Order Combo" : "Order via WhatsApp"}</a>;
}

function ProductCard({ product, combo = false }) {
  return (
    <article className={`card${combo ? " combo-card" : ""}`}>
      {combo && <span className="save-tag">{product.saveTag}</span>}
      <ProductGallery product={product} />
      <div>
        <span className="card-badge">{product.badge}</span>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        {!combo && product.specs?.length > 0 && (
          <ul className="specs">
            {product.specs.map((spec) => {
              const labelEnd = spec.indexOf("</strong>");
              const hasLabel = spec.startsWith("<strong>") && labelEnd !== -1;

              return (
                <li key={spec}>
                  {hasLabel ? <><strong>{spec.slice(8, labelEnd)}</strong>{spec.slice(labelEnd + 9)}</> : spec}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {product.price && (
        <div className="price-box">
          <span className="price">{product.price}</span>
          {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
        </div>
      )}
      <OrderLink product={product} combo={combo} />
    </article>
  );
}

export default function App() {
  const [products, setProducts] = useState(siteData.products);
  const [sections, setSections] = useState(siteData.sections);
  const [catalogError, setCatalogError] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === "#admin");
  const [showScrollTop, setShowScrollTop] = useState(window.scrollY > 320);

  useEffect(() => {
    const updateRoute = () => setIsAdminRoute(window.location.hash === "#admin");
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener("scroll", updateScrollPosition, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollPosition);
  }, []);

  useEffect(() => {
    let active = true;
    getCatalog().then((catalog) => {
      if (!active) return;
      setProducts(catalog.products);
      setSections(catalog.sections);
      setCatalogError(Boolean(catalog.error));
    });
    return () => { active = false; };
  }, []);

  if (isAdminRoute) return <AdminDashboard />;

  return (
    <>
      <header>
        <h1 className="brand-title">
          <a href="#top" id="logo-link" title="Scroll to top" onContextMenu={(event) => event.preventDefault()}>
            <img src={siteData.header.logoUrl} alt={`${siteData.header.title} logo`} className="brand-logo" />
          </a>
        </h1>
        <p className="brand-tagline">{siteData.header.tagline}</p>
        <div className="hero-pills">
          {siteData.header.pills.map((pill) => <span className="pill" key={pill}>{pill}</span>)}
        </div>
      </header>

      <main className="container" id="top">
        {catalogError && <p className="catalog-notice" role="status">Catalog service is unavailable. Showing the saved product catalog.</p>}
        {sections.map((section) => {
          const sectionProducts = products.filter((product) => product.sectionId === section.id);
          if (!sectionProducts.length) return null;

          return (
            <section key={section.id} aria-labelledby={`catalog-section-${section.id}`}>
              <h2 className="section-title" id={`catalog-section-${section.id}`}>{section.title}</h2>
              <div className="grid">
                {sectionProducts.map((product) => <ProductCard key={product.id} product={product} combo={product.type === "combo"} />)}
              </div>
            </section>
          );
        })}
        <h2 className="section-title glow-text" aria-label="Something big is coming soon">
          <span className="status-dot" aria-hidden="true" />
          <span>Something big is coming soon</span>
        </h2>
        <div className="features-grid">
          {siteData.features.map((feature) => (
            <div className="feature-item" key={feature.title}>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer>
        <h3>Petify Group</h3>
        <p className="footer-location">{siteData.contact.location}</p>
        <div className="contact-details">
          <p>Phone: <a href={`tel:+${siteData.contact.whatsappNumber}`}>{siteData.contact.phoneDisplay}</a></p>
          <p>Email: <a href={`mailto:${siteData.contact.email}`}>{siteData.contact.email}</a></p>
        </div>
        <p className="footer-legal">© Petify Group. All rights reserved.<br />*Not for human consumption. Store in a cool, dry place.</p>
        {/* <a className="admin-entry-link" href="/#admin">Admin</a> */}
      </footer>
      {showScrollTop && (
        <button
          className="back-to-top"
          type="button"
          aria-label="Go to top"
          title="Go to top"
          onClick={() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              window.scrollTo(0, 0);
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <span aria-hidden="true">↑</span>
        </button>
      )}
    </>
  );
}