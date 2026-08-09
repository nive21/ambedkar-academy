export function ApplyForCoaching({ className = '' } = {}) {
  const classes = ['events-book-btn', className].filter(Boolean).join(' ');

  return (
    <a className={classes} href="/apply">
      <span className="events-book-btn__edge events-book-btn__edge--left" aria-hidden="true" />
      <span className="events-book-btn__edge events-book-btn__edge--right" aria-hidden="true" />
      <span className="events-book-btn__label">APPLY FOR COACHING</span>
    </a>
  );
}
