export default function StoreFooter({ footerTitle, footerCopyright, footerDisclaimer, contact, visibility }) {
  return (
    <footer id="site-footer">
      <h3>{footerTitle}</h3>
      <p className="footer-location">{contact.location}</p>
      <div className="contact-details">
        <p>Phone: <a href={`tel:+${contact.whatsappNumber}`}>{contact.phoneDisplay}</a></p>
        <p>Email: <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
      </div>
      {(visibility.footer_copyright ?? true) && <p className="footer-legal">{footerCopyright}</p>}
      {(visibility.footer_disclaimer ?? true) && <p className="footer-legal">{footerDisclaimer}</p>}
    </footer>
  );
}