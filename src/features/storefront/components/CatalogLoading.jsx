export default function CatalogLoading() {
  return (
    <section className="catalog-loading" role="status" aria-busy="true" aria-labelledby="catalog-loading-title">
      <div className="catalog-loading-feature">
        <img src="/images/bird.png" alt="" />
        <div className="catalog-loading-copy">
          <p className="catalog-loading-kicker">STORE CATALOG</p>
          <h2 id="catalog-loading-title">Getting the shop ready</h2>
          <p>Fetching the latest products for you.</p>
          <div className="catalog-loading-progress" role="progressbar" aria-label="Loading products"><span /></div>
        </div>
      </div>
      <div className="catalog-loading-skeletons" aria-hidden="true">
        {[0, 1, 2].map((item) => <span key={item} />)}
      </div>
    </section>
  );
}