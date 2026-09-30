export default function StoreHeader({ brandTitle, tagline, logoUrl, heroPills, onPillClick }) {
  return (
    <header id="site-header">
      <h1 className="brand-title">
        {logoUrl && (
          <a href="#top" id="logo-link" title="Scroll to top" onContextMenu={(event) => event.preventDefault()}>
            <img src={logoUrl} alt={`${brandTitle} logo`} className="brand-logo" />
          </a>
        )}
      </h1>
      <p className="brand-tagline">{tagline}</p>
      <div className="hero-pills">
        {heroPills.map((pill) => pill.target
          ? <a className="pill" href={pill.target} key={pill.id} onClick={(event) => onPillClick(event, pill.target)}>{pill.label}</a>
          : <span className="pill" key={pill.id}>{pill.label}</span>)}
      </div>
    </header>
  );
}