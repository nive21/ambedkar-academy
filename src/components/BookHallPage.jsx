import { useMemo, useState } from 'react';
import hallPhoto1 from '../assets/book-hall-photo1.svg';
import hallPhoto2 from '../assets/book-hall-photo2.svg';

const facilities = [
  'Accommodates around 100 people',
  'Stage with podium for public address system',
  'Adequate plastic chairs for seating',
  'Metro water supply',
  'Bus facility near the hall',
  'Electricity at commercial rates',
  'Tables for serving food'
];

const notProvided = [
  'Air-conditioning',
  'Generator set',
  'Assigned parking space',
  'Changing rooms'
];

const charges = [
  '₹7,500 for half day (6am to 3pm or 2pm to 10pm)',
  '₹15,000 for a full day'
];

const eventTypeOptions = [
  'Seminar',
  'Workshop',
  'Lecture',
  'Meeting',
  'Training Program',
  'Other'
];

const bookingSlotOptions = [
  { value: 'half-morning', label: 'Half Day (6am to 3pm)', price: 7500 },
  { value: 'half-evening', label: 'Half Day (2pm to 10pm)', price: 7500 },
  { value: 'full-day', label: 'Full Day', price: 15000 }
];

const hallRules = [
  'Booking requests are confirmed only after approval and payment completion.',
  'Setup and cleanup must be completed within the selected booking slot.',
  'Any damage to hall property will be charged to the organizer.',
  'Use of decorations must not damage walls, flooring, or fixtures.',
  'Sound levels must remain appropriate for the neighborhood.',
  'The hall must be handed over in clean condition after the event.',
  'Commercial activity requires prior written approval.',
  'Management reserves the right to refuse or cancel bookings for policy violations.'
];

function FormField({ label, name, type = 'text', required = false, placeholder = '', accept = '' }) {
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
        accept={accept}
      />
    </label>
  );
}

function SelectField({ label, name, required = false, options = [] }) {
  return (
    <label className="book-hall-field">
      <span className="book-hall-field__label">
        {label}
        {required ? ' *' : ''}
      </span>
      <select className="book-hall-field__control" name={name} required={required} defaultValue="">
        <option value="" disabled>
          Select event type
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function BookHallPage() {
  const [bookingSlot, setBookingSlot] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const totalPrice = useMemo(
    () => bookingSlotOptions.find((option) => option.value === bookingSlot)?.price ?? 0,
    [bookingSlot]
  );

  return (
    <main className="book-hall-page">
      <div className="book-hall-page__line line-brush-h" aria-hidden="true" />

      <section className="book-hall-shell">
        <header className="book-hall-header">
          <div className="book-hall-header__content">
            <a className="book-hall-back" href="/">
              Back To Academy
            </a>
            <h1 className="book-hall-title">Book Hall</h1>
            <p className="book-hall-subtitle">
              Reserve The People&apos;s Educational Trust hall for workshops, community meetings,
              lectures, and educational programs.
            </p>
          </div>
          <div className="book-hall-photos">
            <img
              className="book-hall-photo book-hall-photo--1"
              src={hallPhoto1}
              alt="Book hall view 1"
              loading="lazy"
            />
            <img
              className="book-hall-photo book-hall-photo--2"
              src={hallPhoto2}
              alt="Book hall view 2"
              loading="lazy"
            />
          </div>
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
              <h2>Not Provided</h2>
              <ul>
                {notProvided.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="book-hall-card">
              <h2>Charges (Inclusive Of Water And Electricity)</h2>
              <ul>
                {charges.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="book-hall-card">
              <h2>Address</h2>
              <p>No. 73, L Block, 24th Street</p>
              <p>Anna Nagar East, Chennai - 600 102</p>
            </section>
          </aside>

          <section className="book-hall-form-wrap" aria-label="Hall booking request form">
            <h2 className="book-hall-form-title">Booking Request</h2>
            <p className="book-hall-form-note">
              Once your request is approved, you&apos;ll receive an email notification with payment
              instructions. Your booking will be confirmed on completion of payment.
            </p>
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
                <label className="book-hall-field">
                  <span className="book-hall-field__label">Time Slot *</span>
                  <select
                    className="book-hall-field__control"
                    name="bookingSlot"
                    required
                    value={bookingSlot}
                    onChange={(event) => setBookingSlot(event.target.value)}
                  >
                    <option value="" disabled>
                      Select half day or full day
                    </option>
                    {bookingSlotOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {bookingSlot ? (
                <p className="book-hall-price" aria-live="polite">
                  Total Price: ₹{totalPrice.toLocaleString('en-IN')}
                </p>
              ) : null}

              <div className="book-hall-form__row">
                <FormField
                  label="Aadhar ID (Image or PDF)"
                  name="aadharId"
                  type="file"
                  accept="image/*,.pdf"
                  required
                />
              </div>

              <div className="book-hall-form__row">
                <SelectField
                  label="Event Type"
                  name="eventType"
                  required
                  options={eventTypeOptions}
                />
                <FormField
                  label="Address"
                  name="address"
                  required
                  placeholder="Enter your full address"
                />
              </div>

              <label className="book-hall-field">
                <span className="book-hall-field__label">Short Description Of Event *</span>
                <textarea
                  className="book-hall-field__control book-hall-field__control--textarea"
                  name="eventDescription"
                  required
                  placeholder="Briefly describe the event."
                />
              </label>

              <div className="book-hall-submit-row">
                <button className="book-hall-submit" type="submit">
                  Submit Request
                </button>
                <p className="book-hall-consent">
                  By submitting this form, I agree to abide by the{' '}
                  <button
                    className="book-hall-link"
                    type="button"
                    onClick={() => setIsRulesOpen(true)}
                  >
                    rules &amp; regulations
                  </button>{' '}
                  governing the use of the hall.
                </p>
              </div>
            </form>
          </section>
        </div>
      </section>

      {isRulesOpen ? (
        <div className="book-hall-modal-backdrop" role="presentation" onClick={() => setIsRulesOpen(false)}>
          <div
            className="book-hall-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Rules and regulations"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Rules &amp; Regulations</h3>
            <ul>
              {hallRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <button className="book-hall-modal-close" type="button" onClick={() => setIsRulesOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
