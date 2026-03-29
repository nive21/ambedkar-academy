import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ADMIN_EMAIL = import.meta.env.VITE_BOOKING_ADMIN_EMAIL;

function defaultEventFormState() {
  return {
    eventDate: '',
    startTime: '',
    endTime: '',
    eventType: '',
    description: ''
  };
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function slotLabel(slot) {
  if (slot === 'half-morning') return 'Half Day (6am to 3pm)';
  if (slot === 'half-evening') return 'Half Day (2pm to 10pm)';
  return 'Full Day';
}

export default function AdminEventsPage() {
  const [accessKey, setAccessKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eventDrafts, setEventDrafts] = useState({});
  const [denyReasons, setDenyReasons] = useState({});
  const [bookingMessages, setBookingMessages] = useState({});
  const [newEvent, setNewEvent] = useState(defaultEventFormState());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  async function callAdmin(action, payload = {}) {
    const { data, error: fnError } = await supabase.functions.invoke('admin-events', {
      body: { action, accessKey, ...payload }
    });

    if (fnError) {
      throw new Error(fnError.message || 'Admin action failed.');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }

  async function loadDashboardData() {
    setLoading(true);
    setError('');
    try {
      const [eventsData, bookingsData] = await Promise.all([
        callAdmin('list-events'),
        callAdmin('list-bookings')
      ]);

      const eventRows = eventsData?.events ?? [];
      const bookingRows = bookingsData?.bookings ?? [];
      setEvents(eventRows);
      setBookings(bookingRows);
      setEventDrafts(
        eventRows.reduce((acc, eventItem) => {
          acc[eventItem.id] = {
            eventDate: eventItem.event_date,
            startTime: eventItem.start_time,
            endTime: eventItem.end_time,
            eventType: eventItem.event_type,
            description: eventItem.description
          };
          return acc;
        }, {})
      );
      setDenyReasons(
        bookingRows.reduce((acc, booking) => {
          acc[booking.id] = booking.rejection_reason ?? '';
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message || 'Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthorized) return;
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  function validateEventPayload(payload) {
    if (!payload.eventDate || !payload.startTime || !payload.endTime || !payload.eventType || !payload.description) {
      return 'Please fill date, start time, end time, event type, and description.';
    }
    if (payload.endTime <= payload.startTime) {
      return 'End time must be after start time.';
    }
    return '';
  }

  function clearStatus() {
    setError('');
    setSuccess('');
  }

  function setBookingMessage(bookingId, type, message) {
    setBookingMessages((prev) => ({
      ...prev,
      [bookingId]: { type, message }
    }));
  }

  function statusLabel(status) {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Denied';
    if (status === 'cancelled') return 'Cancelled';
    return 'Pending';
  }

  async function handleUnlock(event) {
    event.preventDefault();
    clearStatus();
    if (!accessKey.trim()) {
      setError('Please enter admin access key.');
      return;
    }
    setIsAuthorized(true);
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    clearStatus();

    const validationError = validateEventPayload(newEvent);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await callAdmin('create-event', {
        event: {
          eventDate: newEvent.eventDate,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          eventType: newEvent.eventType.trim(),
          description: newEvent.description.trim()
        }
      });
      setNewEvent(defaultEventFormState());
      setSuccess('Administrative event created.');
      await loadDashboardData();
    } catch (err) {
      setError(err.message || 'Unable to create event.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEvent(eventId) {
    clearStatus();
    const draft = eventDrafts[eventId];
    const validationError = validateEventPayload(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await callAdmin('update-event', {
        id: eventId,
        event: {
          eventDate: draft.eventDate,
          startTime: draft.startTime,
          endTime: draft.endTime,
          eventType: draft.eventType.trim(),
          description: draft.description.trim()
        }
      });
      setSuccess('Event updated.');
      await loadDashboardData();
    } catch (err) {
      setError(err.message || 'Unable to update event.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEvent(eventId) {
    clearStatus();
    setLoading(true);
    try {
      await callAdmin('delete-event', { id: eventId });
      setSuccess('Event deleted.');
      await loadDashboardData();
    } catch (err) {
      setError(err.message || 'Unable to delete event.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveBooking(bookingId) {
    clearStatus();
    setLoading(true);
    try {
      await callAdmin('set-booking-status', {
        id: bookingId,
        status: 'approved',
        reason: '',
        adminEmail: ADMIN_EMAIL
      });
      setBookingMessage(bookingId, 'success', 'Booking approved and notification sent.');
      await loadDashboardData();
    } catch (err) {
      setBookingMessage(bookingId, 'error', err.message || 'Unable to approve booking.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDenyBooking(bookingId) {
    clearStatus();
    const reason = denyReasons[bookingId]?.trim() ?? '';
    if (!reason) {
      setBookingMessage(bookingId, 'error', 'Please enter a reason before denying a booking.');
      return;
    }
    setLoading(true);
    try {
      await callAdmin('set-booking-status', {
        id: bookingId,
        status: 'rejected',
        reason,
        adminEmail: ADMIN_EMAIL
      });
      setBookingMessage(bookingId, 'success', 'Booking denied and notification sent.');
      await loadDashboardData();
    } catch (err) {
      setBookingMessage(bookingId, 'error', err.message || 'Unable to deny booking.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentToggle(bookingId, paymentReceived) {
    clearStatus();
    setLoading(true);
    try {
      await callAdmin('set-payment-status', {
        id: bookingId,
        paymentReceived
      });
      setBookingMessage(bookingId, 'success', paymentReceived ? 'Marked as paid.' : 'Marked as unpaid.');
      await loadDashboardData();
    } catch (err) {
      setBookingMessage(bookingId, 'error', err.message || 'Unable to update payment status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-events-page">
      <section className="admin-events-shell">
        <a className="admin-events-back" href="/">
          Back To Home
        </a>
        <h1>Admin Dashboard</h1>
        <p>Review booking requests and manage admin-only calendar events.</p>

        {!isAuthorized ? (
          <form className="admin-events-gate" onSubmit={handleUnlock}>
            <label>
              <span>Admin Access Key</span>
              <input
                type="password"
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                placeholder="Enter admin access key"
                autoComplete="off"
              />
            </label>
            <button type="submit">Unlock</button>
          </form>
        ) : (
          <>
            <div className="admin-events-tabs">
              <button
                type="button"
                className={activeTab === 'bookings' ? 'is-active' : ''}
                onClick={() => setActiveTab('bookings')}
                disabled={loading}
              >
                Hall Bookings
              </button>
              <button
                type="button"
                className={activeTab === 'admin-events' ? 'is-active' : ''}
                onClick={() => setActiveTab('admin-events')}
                disabled={loading}
              >
                Admin Events
              </button>
            </div>

            {loading ? (
              <div className="admin-loading" role="status" aria-live="polite">
                <span className="admin-loading-spinner" />
                <span>Loading latest data...</span>
              </div>
            ) : null}

            {activeTab === 'bookings' ? (
              <section className="admin-events-list">
                <h2>Booking Requests</h2>
                {bookings.length === 0 ? <p className="admin-events-empty">No booking requests yet.</p> : null}
                {bookings.map((booking) => (
                  <article key={booking.id} className="admin-events-item">
                    <div className="admin-booking-header">
                      <h3>#{booking.id} · {booking.full_name}</h3>
                      <span className={`admin-booking-status admin-booking-status--${booking.status}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                    <p>
                      <strong>Date:</strong> {formatDate(booking.event_date)} ·{' '}
                      <strong>Slot:</strong> {slotLabel(booking.booking_slot)}
                    </p>
                    <p>
                      <strong>Type:</strong> {booking.event_type}
                    </p>
                    <p>
                      <strong>Description:</strong> {booking.event_description}
                    </p>
                    <p>
                      <strong>Email:</strong> {booking.email} · <strong>Phone:</strong> {booking.phone}
                    </p>
                    <p>
                      <strong>Address:</strong> {booking.address}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{Number(booking.total_price).toLocaleString('en-IN')} ·{' '}
                      <strong>Payment:</strong> {booking.payment_received ? 'Received' : 'Pending'}
                    </p>
                    {booking.status === 'rejected' && booking.rejection_reason ? (
                      <p>
                        <strong>Reason:</strong> {booking.rejection_reason}
                      </p>
                    ) : null}

                    {booking.status === 'pending' ? (
                      <div className="admin-booking-actions">
                        <div className="admin-decision-block">
                          <div className="admin-decision-option">
                            <p className="admin-decision-title">Option 1: Approve</p>
                            <button type="button" onClick={() => handleApproveBooking(booking.id)} disabled={loading}>
                              Approve Request
                            </button>
                          </div>
                          <div className="admin-decision-option">
                            <p className="admin-decision-title">Option 2: Deny</p>
                            <div className="admin-deny-block">
                              <input
                                type="text"
                                value={denyReasons[booking.id] ?? ''}
                                placeholder="Reason for denial"
                                onChange={(event) =>
                                  setDenyReasons((prev) => ({ ...prev, [booking.id]: event.target.value }))
                                }
                              />
                              <button
                                type="button"
                                className="admin-events-danger"
                                onClick={() => handleDenyBooking(booking.id)}
                                disabled={loading}
                              >
                                Deny Request
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {booking.status === 'approved' ? (
                      <div className="admin-booking-actions">
                        <button
                          type="button"
                          onClick={() => handlePaymentToggle(booking.id, !booking.payment_received)}
                          disabled={loading}
                        >
                          {booking.payment_received ? 'Mark As Unpaid' : 'Mark As Paid'}
                        </button>
                      </div>
                    ) : null}

                    {bookingMessages[booking.id] ? (
                      <p
                        className={`admin-inline-status ${
                          bookingMessages[booking.id].type === 'error'
                            ? 'admin-inline-status--error'
                            : 'admin-inline-status--success'
                        }`}
                        aria-live="polite"
                      >
                        {bookingMessages[booking.id].message}
                      </p>
                    ) : null}
                  </article>
                ))}
              </section>
            ) : null}

            {activeTab === 'admin-events' ? (
              <>
                <form className="admin-events-form" onSubmit={handleCreateEvent}>
                  <h2>Add Event</h2>
                  <div className="admin-events-form-grid">
                    <label>
                      <span>Date</span>
                      <input
                        type="date"
                        min={todayIso}
                        value={newEvent.eventDate}
                        onChange={(event) =>
                          setNewEvent((prev) => ({ ...prev, eventDate: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label>
                      <span>Start Time</span>
                      <input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(event) =>
                          setNewEvent((prev) => ({ ...prev, startTime: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <label>
                      <span>End Time</span>
                      <input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(event) =>
                          setNewEvent((prev) => ({ ...prev, endTime: event.target.value }))
                        }
                        required
                      />
                    </label>
                  </div>
                  <label>
                    <span>Event Type</span>
                    <input
                      type="text"
                      value={newEvent.eventType}
                      onChange={(event) => setNewEvent((prev) => ({ ...prev, eventType: event.target.value }))}
                      placeholder="Administrative review / Internal meeting / ..."
                      required
                    />
                  </label>
                  <label>
                    <span>Short Description</span>
                    <textarea
                      value={newEvent.description}
                      onChange={(event) =>
                        setNewEvent((prev) => ({ ...prev, description: event.target.value }))
                      }
                      placeholder="Briefly describe the event."
                      required
                    />
                  </label>
                  <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Add Event'}
                  </button>
                </form>

                {error ? <p className="admin-events-status admin-events-status--error">{error}</p> : null}
                {success ? <p className="admin-events-status admin-events-status--success">{success}</p> : null}

                <section className="admin-events-list">
                  <h2>Manage Events</h2>
                  {events.length === 0 ? <p className="admin-events-empty">No events yet.</p> : null}
                  {events.map((eventItem) => {
                    const draft = eventDrafts[eventItem.id] ?? {
                      eventDate: eventItem.event_date,
                      startTime: eventItem.start_time,
                      endTime: eventItem.end_time,
                      eventType: eventItem.event_type,
                      description: eventItem.description
                    };

                    return (
                      <article key={eventItem.id} className="admin-events-item">
                        <div className="admin-events-form-grid">
                          <label>
                            <span>Date</span>
                            <input
                              type="date"
                              value={draft.eventDate}
                              min={todayIso}
                              onChange={(event) =>
                                setEventDrafts((prev) => ({
                                  ...prev,
                                  [eventItem.id]: { ...draft, eventDate: event.target.value }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span>Start Time</span>
                            <input
                              type="time"
                              value={draft.startTime}
                              onChange={(event) =>
                                setEventDrafts((prev) => ({
                                  ...prev,
                                  [eventItem.id]: { ...draft, startTime: event.target.value }
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span>End Time</span>
                            <input
                              type="time"
                              value={draft.endTime}
                              onChange={(event) =>
                                setEventDrafts((prev) => ({
                                  ...prev,
                                  [eventItem.id]: { ...draft, endTime: event.target.value }
                                }))
                              }
                            />
                          </label>
                        </div>
                        <label>
                          <span>Event Type</span>
                          <input
                            type="text"
                            value={draft.eventType}
                            onChange={(event) =>
                              setEventDrafts((prev) => ({
                                ...prev,
                                [eventItem.id]: { ...draft, eventType: event.target.value }
                              }))
                            }
                          />
                        </label>
                        <label>
                          <span>Short Description</span>
                          <textarea
                            value={draft.description}
                            onChange={(event) =>
                              setEventDrafts((prev) => ({
                                ...prev,
                                [eventItem.id]: { ...draft, description: event.target.value }
                              }))
                            }
                          />
                        </label>
                        <div className="admin-events-actions">
                          <button type="button" onClick={() => handleUpdateEvent(eventItem.id)} disabled={loading}>
                            Update
                          </button>
                          <button
                            type="button"
                            className="admin-events-danger"
                            onClick={() => handleDeleteEvent(eventItem.id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </section>
              </>
            ) : null}
          </>
        )}

      </section>
    </main>
  );
}
