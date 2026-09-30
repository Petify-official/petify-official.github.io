import { useState } from "react";

const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='16' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductGallery({ product }) {
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
          {images.map((image, index) => <span key={`${image}-dot-${index}`} className={`dot${index === activeIndex ? " active" : ""}`} />)}
        </div>
      )}
    </div>
  );
}