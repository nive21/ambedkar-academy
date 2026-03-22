export default function EventsSection() {
  const events = [
    {
      date: '21/3',
      time: '2 – 4 PM: Workshop',
      desc:
        'Some introduction to the event goes here. Some introduction to the event goes here. Some introduction to the event goes here. Some introduction to the event goes here.'
    },
    {
      date: '2/4',
      time: '4 – 10 PM: Monthly meeting',
      desc: 'Some introduction to the event goes here. Some introduction to the event goes here.'
    },
    {
      date: '24/4',
      time: '10 – 11 PM: Seminar',
      desc: 'Some introduction to the event goes here. Some introduction to the event goes here.'
    }
  ];

  return (
    <section className="events-section">
      <div className="events-inner">
        <div className="events-layout">
          <div className="events-page" aria-label="Upcoming events">
            <div className="events-card">
              <a
                className="events-book-btn"
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="events-book-btn__edge events-book-btn__edge--left" aria-hidden="true" />
                <span className="events-book-btn__edge events-book-btn__edge--right" aria-hidden="true" />
                <span className="events-book-btn__label">BOOK Hall</span>
              </a>

              <div className="events-title">
                <p>Upcoming</p>
                <p>Events</p>
              </div>

              <div className="events-container">
                {events.map((event) => (
                  <div className="events-row-group" key={`${event.date}-${event.time}`}>
                    <div className="events-divider" />
                    <div className="events-row">
                      <p className="events-date">{event.date}</p>
                      <p className="events-time">{event.time}</p>
                      <p className="events-desc">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="next-events-button-container">
              <button className="events-next-btn" disabled aria-disabled="true" tabIndex={-1}>
                <svg viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 11H25M25 11L15 1M25 11L15 21"
                    stroke="#4c2c1b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              </div>
            </div>
          </div>

          <div className="events-address">
            <p>The People's Educational Trust – Dr. Ambedkar Academy:</p>
            <p>&nbsp;</p>
            <p>No. 73, L Block, 24th Street,</p>
            <p>Anna Nagar East,</p>
            <p>Chennai – 600 102</p>
          </div>
        </div>
      </div>
    </section>
  );
}
