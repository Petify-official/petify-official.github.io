import ProductCard from "./ProductCard.jsx";

export default function CatalogSections({ sections, products, whatsappNumber }) {
  return sections.map((section) => {
    const sectionProducts = products.filter((product) => product.sectionId === section.id);
    if (!sectionProducts.length) return null;

    return (
      <section key={section.id} aria-labelledby={`catalog-section-${section.id}`}>
        <h2 className="section-title" id={`catalog-section-${section.id}`}>{section.title}</h2>
        <div className="grid">
          {sectionProducts.map((product) => <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />)}
        </div>
      </section>
    );
  });
}