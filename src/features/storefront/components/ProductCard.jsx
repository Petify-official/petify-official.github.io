import ProductGallery from "./ProductGallery.jsx";

function OrderLink({ product, whatsappNumber, combo }) {
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(product.defaultWhatsappMsg)}`;
  return <a href={link} className="btn" target="_blank" rel="noopener noreferrer">{combo ? "Order Combo" : "Order via WhatsApp"}</a>;
}

export default function ProductCard({ product, whatsappNumber }) {
  const combo = product.type === "combo";

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
              return <li key={spec}>{hasLabel ? <><strong>{spec.slice(8, labelEnd)}</strong>{spec.slice(labelEnd + 9)}</> : spec}</li>;
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
      <OrderLink product={product} whatsappNumber={whatsappNumber} combo={combo} />
    </article>
  );
}