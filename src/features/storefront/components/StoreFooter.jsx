export default function StoreFooter({ footerTitle, footerLegal, contact }) {
  return (
    <footer id="site-footer">
      <h3>{footerTitle}</h3>
      <p className="footer-location">{contact.location}</p>
      <div className="contact-details">
        <p>Phone: <a href={`tel:+${contact.whatsappNumber}`}>{contact.phoneDisplay}</a></p>
        <p>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
      </div>
      <p className="footer-legal">{footerLegal}</p>
    </footer>
  );
}