import { useEffect, useMemo, useState } from 'react';
import hallPhoto1 from '../assets/book-hall-photo1.svg';
import hallPhoto2 from '../assets/book-hall-photo2.svg';
import { supabase } from '../lib/supabaseClient';

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

const MIN_DAYS_AHEAD = 7;
const ADMIN_EMAIL = import.meta.env.VITE_BOOKING_ADMIN_EMAIL;

function toIsoDate(value) {
  return value.toISOString().split('T')[0];
}

function getMinBookingDateIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + MIN_DAYS_AHEAD);
  return toIsoDate(date);
}

function getDisplayDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function sanitizeFileName(fileName) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
}

function createBookedSlotsMap(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.event_date]) {
      acc[row.event_date] = new Set();
    }
    acc[row.event_date].add(row.booking_slot);
    return acc;
  }, {});
}

function getSlotState(bookedSlots = new Set()) {
  const hasFullDay = bookedSlots.has('full-day');
  const hasHalfMorning = bookedSlots.has('half-morning');
  const hasHalfEvening = bookedSlots.has('half-evening');

  return {
    'half-morning': hasFullDay || hasHalfMorning,
    'half-evening': hasFullDay || hasHalfEvening,
    'full-day': hasFullDay || hasHalfMorning || hasHalfEvening
  };
}

function FormField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
  accept = '',
  value,
  onChange,
  min,
  disabled = false
}) {
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
        value={value}
        onChange={onChange}
        min={min}
        disabled={disabled}
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
  const minBookingDate = useMemo(() => getMinBookingDateIso(), []);
  const [bookingSlot, setBookingSlot] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState('idle');

  const totalPrice = useMemo(
    () => bookingSlotOptions.find((option) => option.value === bookingSlot)?.price ?? 0,
    [bookingSlot]
  );

  const selectedDateSlots = bookedSlotsByDate[eventDate] ?? new Set();
  const slotState = getSlotState(selectedDateSlots);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingBookings() {
      const { data, error } = await supabase
        .from('hall_bookings')
        .select('event_date, booking_slot')
        .in('status', ['pending', 'approved'])
        .gte('event_date', minBookingDate);

      if (!isMounted) return;

      if (error) {
        setFormError('Unable to load booking availability right now. Please try again shortly.');
        return;
      }

      setBookedSlotsByDate(createBookedSlotsMap(data ?? []));
    }

    loadExistingBookings();

    return () => {
      isMounted = false;
    };
  }, [minBookingDate]);

  function isDateFullyBooked(dateValue) {
    const states = getSlotState(bookedSlotsByDate[dateValue] ?? new Set());
    return states['half-morning'] && states['half-evening'] && states['full-day'];
  }

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setEventDate(nextDate);
    setBookingSlot('');
    setFormError('');
    setFormSuccess('');
    setUploadState('idle');

    if (!nextDate) return;

    if (nextDate < minBookingDate) {
      setFormError(
        `Bookings must be at least 7 days in advance. Earliest available date is ${getDisplayDate(minBookingDate)}.`
      );
      return;
    }

    if (isDateFullyBooked(nextDate)) {
      setFormError('This date is already fully booked. Please select another date.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!eventDate) {
      setFormError('Please select an event date.');
      return;
    }

    if (eventDate < minBookingDate) {
      setFormError(
        `Bookings must be at least 7 days in advance. Earliest available date is ${getDisplayDate(minBookingDate)}.`
      );
      return;
    }

    if (!bookingSlot) {
      setFormError('Please select a valid booking slot.');
      return;
    }

    if (slotState[bookingSlot]) {
      setFormError('The selected slot has already been booked. Please choose another slot.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const aadharFile = formData.get('aadharId');

    if (!(aadharFile instanceof File) || aadharFile.size === 0) {
      setFormError('Please upload a valid Aadhar ID file (image or PDF).');
      return;
    }

    setIsSubmitting(true);
    let uploadedFilePath = '';

    try {
      const safeFileName = sanitizeFileName(aadharFile.name);
      const filePath = `${eventDate}/${Date.now()}-${safeFileName}`;
      uploadedFilePath = filePath;
      setUploadState('uploading');

      const { error: uploadError } = await supabase.storage
        .from('booking-documents')
        .upload(filePath, aadharFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: aadharFile.type
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }
      setUploadState('uploaded');

      const payload = {
        full_name: formData.get('fullName'),
        organization: formData.get('organization') || null,
        email: formData.get('email'),
        phone: formData.get('phone'),
        event_date: eventDate,
        booking_slot: bookingSlot,
        event_type: formData.get('eventType'),
        address: formData.get('address'),
        event_description: formData.get('eventDescription'),
        total_price: totalPrice,
        aadhar_file_path: filePath,
        status: 'pending'
      };

      const { data: bookingData, error: insertError } = await supabase
        .from('hall_bookings')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('That date/slot was just booked by someone else. Please choose another slot.');
        }
        throw new Error(`Booking submission failed: ${insertError.message}`);
      }

      const { error: emailError } = await supabase.functions.invoke('send-booking-emails', {
        body: {
          bookingId: bookingData.id,
          fullName: payload.full_name,
          userEmail: payload.email,
          adminEmail: ADMIN_EMAIL,
          eventDate: payload.event_date,
          bookingSlot: payload.booking_slot,
          totalPrice: payload.total_price
        }
      });

      if (emailError) {
        throw new Error(`Booking submitted, but email notification failed: ${emailError.message}`);
      }

      setBookedSlotsByDate((prev) => {
        const next = { ...prev };
        if (!next[eventDate]) {
          next[eventDate] = new Set();
        }
        next[eventDate].add(bookingSlot);
        return next;
      });

      event.currentTarget.reset();
      setEventDate('');
      setBookingSlot('');
      setUploadState('idle');
      setFormSuccess(
        'Booking request submitted successfully. Confirmation emails have been sent to you and the admin.'
      );
    } catch (err) {
      if (uploadedFilePath) {
        await supabase.storage.from('booking-documents').remove([uploadedFilePath]);
      }
      setUploadState('idle');
      setFormError(err.message || 'Unable to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <form className="book-hall-form" onSubmit={handleSubmit}>
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
                <FormField
                  label="Event Date"
                  name="eventDate"
                  type="date"
                  required
                  min={minBookingDate}
                  value={eventDate}
                  onChange={handleDateChange}
                />
                <label className="book-hall-field">
                  <span className="book-hall-field__label">Time Slot *</span>
                  <select
                    className="book-hall-field__control"
                    name="bookingSlot"
                    required
                    value={bookingSlot}
                    disabled={!eventDate || eventDate < minBookingDate || isDateFullyBooked(eventDate)}
                    onChange={(event) => {
                      setBookingSlot(event.target.value);
                      setFormError('');
                      setFormSuccess('');
                    }}
                  >
                    <option value="" disabled>
                      Select half day or full day
                    </option>
                    {bookingSlotOptions.map((option) => (
                      <option key={option.value} value={option.value} disabled={slotState[option.value]}>
                        {option.label}
                        {slotState[option.value] ? ' (Already booked)' : ''}
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

              {formError ? <p className="book-hall-status book-hall-status--error">{formError}</p> : null}
              {formSuccess ? <p className="book-hall-status book-hall-status--success">{formSuccess}</p> : null}

              <div className="book-hall-form__row">
                <label className="book-hall-field">
                  <span className="book-hall-field__label">Aadhar ID (Image or PDF) *</span>
                  <div className="book-hall-upload-wrap">
                    <input
                      className="book-hall-field__control"
                      name="aadharId"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={() => {
                        setFormError('');
                        setFormSuccess('');
                        setUploadState('idle');
                      }}
                    />
                    {console.log(uploadState)}
                    <span className="book-hall-upload-state" aria-live="polite">
                      {uploadState === 'uploading' ? (
                        <span className="book-hall-spinner" aria-label="Upload in progress" />
                      ) : null}
                      {uploadState === 'uploaded' ? (
                        <span className="book-hall-check" aria-label="Upload successful">
                          ✓
                        </span>
                      ) : null}
                    </span>
                  </div>
                </label>
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
                <button className="book-hall-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
