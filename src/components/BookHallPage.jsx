const facilities = [
  'Air-conditioned hall with flexible seating',
  'Dedicated stage and podium setup',
  'Projector and basic audio support',
  'Accessible washroom and entry access',
  'On-site support during event hours'
];

const usageNotes = [
  'Bookings are confirmed only after coordinator approval.',
  'Setup and teardown time must be included in your slot request.',
  'Commercial use requires prior written permission.',
  'Food service is permitted only in approved zones.'
];

function FormField({ label, name, type = 'text', required = false, placeholder = '' }) {
  return (
    <label className="book-hall-field">
      <span className="book-hall-field__label">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        className="book-hall-field__control"
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export default function BookHallPage() {
  return (
    <main className="book-hall-page">
      <div className="book-hall-page__line line-brush-h" aria-hidden="true" />

      <section className="book-hall-shell">
        <header className="book-hall-header">
          <a className="book-hall-back" href="/">
            Back To Academy
          </a>
          <h1 className="book-hall-title">Book Hall</h1>
          <p className="book-hall-subtitle">
            Reserve The People&apos;s Educational Trust hall for workshops, community meetings,
            lectures, and educational programs.
          </p>
        </header>

        <div className="book-hall-grid">
          <aside className="book-hall-info">
            <section className="book-hall-card">
              <h2>Hall Facilities</h2>
              <ul>
                {facilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="book-hall-card">
              <h2>Usage Notes</h2>
              <ul>
                {usageNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="book-hall-address">
              <h2>Address</h2>
              <p>No. 73, L Block, 24th Street</p>
              <p>Anna Nagar East, Chennai - 600 102</p>
            </section>
          </aside>

          <section className="book-hall-form-wrap" aria-label="Hall booking request form">
            <h2 className="book-hall-form-title">Booking Request</h2>
            <form className="book-hall-form">
              <div className="book-hall-form__row">
                <FormField
                  label="Full Name"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                />
                <FormField
                  label="Organization"
                  name="organization"
                  placeholder="School, trust, or group name"
                />
              </div>

              <div className="book-hall-form__row">
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91"
                />
              </div>

              <div className="book-hall-form__row">
                <FormField label="Event Date" name="eventDate" type="date" required />
                <FormField label="Start Time" name="startTime" type="time" required />
                <FormField label="End Time" name="endTime" type="time" required />
              </div>

              <div className="book-hall-form__row">
                <FormField
                  label="Expected Attendees"
                  name="attendees"
                  type="number"
                  required
                  placeholder="e.g. 120"
                />
                <FormField
                  label="Event Type"
                  name="eventType"
                  required
                  placeholder="Workshop, seminar, lecture..."
                />
              </div>

              <label className="book-hall-field">
                <span className="book-hall-field__label">Event Details *</span>
                <textarea
                  className="book-hall-field__control book-hall-field__control--textarea"
                  name="eventDetails"
                  required
                  placeholder="Share event purpose, setup requirements, and any special needs."
                />
              </label>

              <button className="book-hall-submit" type="submit">
                Submit Request
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
