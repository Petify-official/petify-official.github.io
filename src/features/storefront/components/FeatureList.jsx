export default function FeatureList({ features }) {
  return (
    <div className="features-grid">
      {features.map((feature) => (
        <div className="feature-item" key={feature.title}>
          <h4>{feature.title}</h4>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}