export function BookHall({ className = '' } = {}) {
  const classes = ['events-book-btn', className].filter(Boolean).join(' ');

  return (
    <a
      className={classes}
      href="https://www.google.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="events-book-btn__edge events-book-btn__edge--left" aria-hidden="true" />
      <span className="events-book-btn__edge events-book-btn__edge--right" aria-hidden="true" />
      <span className="events-book-btn__label">BOOK Hall</span>
    </a>
  );
}
