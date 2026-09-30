import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard.jsx";
import CatalogLoading from "./features/storefront/components/CatalogLoading.jsx";
import CatalogSections from "./features/storefront/components/CatalogSections.jsx";
import FeatureList from "./features/storefront/components/FeatureList.jsx";
import ScrollToTop from "./features/storefront/components/ScrollToTop.jsx";
import StoreFooter from "./features/storefront/components/StoreFooter.jsx";
import StoreHeader from "./features/storefront/components/StoreHeader.jsx";
import useStorefrontCatalog from "./features/storefront/useStorefrontCatalog.js";

export default function App() {
  const { products, sections, settings, loading, error } = useStorefrontCatalog();
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
    if (settings?.brandTitle) document.title = settings.brandTitle;
  }, [settings?.brandTitle]);

  function scrollToHeroTarget(event, target) {
    event.preventDefault();
    const element = document.getElementById(target.slice(1));
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top);
    } else {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function scrollToTop() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (isAdminRoute) return <AdminDashboard />;

  return (
    <>
      <StoreHeader
        brandTitle={settings?.brandTitle ?? ""}
        tagline={settings?.tagline ?? ""}
        logoUrl={settings?.logoUrl ?? ""}
        heroPills={settings?.heroPills ?? []}
        onPillClick={scrollToHeroTarget}
      />
      <main className="container" id="top">
        {loading ? <CatalogLoading /> : error ? (
          <p className="catalog-notice" role="alert">Catalog service is unavailable. Products could not be loaded from Supabase.</p>
        ) : (
          <>
            <CatalogSections sections={sections} products={products} whatsappNumber={settings.contact.whatsappNumber} />
            <h2 className="section-title glow-text" aria-label={settings.comingSoonTitle}>
              <span className="status-dot" aria-hidden="true" />
              <span>{settings.comingSoonTitle}</span>
            </h2>
            <FeatureList features={settings.features} />
          </>
        )}
      </main>
      {!loading && !error && settings && (
        <StoreFooter footerTitle={settings.footerTitle} footerLegal={settings.footerLegal} contact={settings.contact} />
      )}
      {showScrollTop && <ScrollToTop onClick={scrollToTop} />}
    </>
  );
}