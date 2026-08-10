import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ADMIN_EMAIL = import.meta.env.VITE_BOOKING_ADMIN_EMAIL || 'admin@ambedkar-academy.in';
const INTERVIEW_DATE_OPTIONS = ['2026-08-18', '2026-08-19'];
const INTERVIEW_STATUS_OPTIONS = [
  { value: 'not-held-yet', label: 'Not held yet' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in-review', label: 'In review' }
];

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

function interviewStatusLabel(status) {
  return INTERVIEW_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Not held yet';
}

function shortlistStatusLabel(status) {
  if (status === 'shortlisted') return 'Shortlisted';
  if (status === 'rejected') return 'Rejected';
  return 'Pending review';
}

function formatInterviewDate(isoDate) {
  if (!isoDate) return '';
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default function AdminEventsPage() {
  const [accessKey, setAccessKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsError, setApplicationsError] = useState('');
  const [eventDrafts, setEventDrafts] = useState({});
  const [denyReasons, setDenyReasons] = useState({});
  const [bookingMessages, setBookingMessages] = useState({});
  const [applicationMessages, setApplicationMessages] = useState({});
  const [applicationDecisionDrafts, setApplicationDecisionDrafts] = useState({});
  const [openApplicationId, setOpenApplicationId] = useState(null);
  const [newEvent, setNewEvent] = useState(defaultEventFormState());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const interviewDateCounts = useMemo(
    () =>
      applications.reduce((acc, application) => {
        if (application.shortlist_status !== 'shortlisted' || !application.interview_date) {
          return acc;
        }
        acc[application.interview_date] = (acc[application.interview_date] ?? 0) + 1;
        return acc;
      }, {}),
    [applications]
  );

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
    setApplicationsError('');
    try {
      const [eventsResult, bookingsResult, applicationsResult] = await Promise.allSettled([
        callAdmin('list-events'),
        callAdmin('list-bookings'),
        callAdmin('list-group-iv-applications')
      ]);

      if (eventsResult.status === 'rejected') {
        throw eventsResult.reason;
      }

      if (bookingsResult.status === 'rejected') {
        throw bookingsResult.reason;
      }

      const eventRows = eventsResult.value?.events ?? [];
      const bookingRows = bookingsResult.value?.bookings ?? [];
      const applicationRows =
        applicationsResult.status === 'fulfilled' ? applicationsResult.value?.applications ?? [] : [];

      setEvents(eventRows);
      setBookings(bookingRows);
      setApplications(applicationRows);
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
      setApplicationDecisionDrafts(
        applicationRows.reduce((acc, application) => {
          const interviewDate = application.interview_date ?? '';
          acc[application.id] = {
            selectedDateOption: INTERVIEW_DATE_OPTIONS.includes(interviewDate) ? interviewDate : interviewDate ? 'custom' : '',
            customInterviewDate: interviewDate && !INTERVIEW_DATE_OPTIONS.includes(interviewDate) ? interviewDate : ''
          };
          return acc;
        }, {})
      );
      setOpenApplicationId((current) =>
        applicationRows.some((application) => application.id === current) ? current : null
      );

      if (applicationsResult.status === 'rejected') {
        setApplicationsError(
          applicationsResult.reason?.message || 'Group IV applications could not be loaded.'
        );
      }
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

  function setApplicationMessage(applicationId, type, message) {
    setApplicationMessages((prev) => ({
      ...prev,
      [applicationId]: { type, message }
    }));
  }

  function statusLabel(status) {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Denied';
    if (status === 'cancelled') return 'Cancelled';
    return 'Pending';
  }

  async function handleApplicationStatusChange(applicationId, status) {
    clearStatus();
    const application = applications.find((item) => item.id === applicationId);
    const statusText = interviewStatusLabel(status);

    if (!application) {
      setApplicationMessage(applicationId, 'error', 'Application not found.');
      return;
    }

    const confirmed = window.confirm(
      `Confirm interview status update for ${application.full_name} to "${statusText}"? This will send confirmation emails to the applicant and admin.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await callAdmin('set-group-iv-application-status', {
        id: applicationId,
        status,
        adminEmail: ADMIN_EMAIL
      });
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? { ...application, interview_status: status } : application
        )
      );
      setApplicationMessage(applicationId, 'success', 'Interview status updated and confirmation emails sent.');
    } catch (err) {
      setApplicationMessage(applicationId, 'error', err.message || 'Unable to update interview status.');
    } finally {
      setLoading(false);
    }
  }

  function getApplicationInterviewDate(applicationId) {
    const draft = applicationDecisionDrafts[applicationId];
    if (!draft) return '';
    return draft.selectedDateOption === 'custom' ? draft.customInterviewDate : draft.selectedDateOption;
  }

  async function handleApplicationDecision(application, shortlistStatus) {
    clearStatus();

    if (shortlistStatus === 'shortlisted') {
      const interviewDate = getApplicationInterviewDate(application.id);
      if (!interviewDate) {
        setApplicationMessage(application.id, 'error', 'Please choose an interview date before shortlisting.');
        return;
      }

      const confirmed = window.confirm(
        `Confirm shortlist for ${application.full_name} on ${formatInterviewDate(interviewDate)}? This will send confirmation emails to the applicant and admin.`
      );

      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Confirm rejection for ${application.full_name}?`);
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await callAdmin('set-group-iv-application-decision', {
        id: application.id,
        shortlistStatus,
        interviewDate: shortlistStatus === 'shortlisted' ? getApplicationInterviewDate(application.id) : null,
        adminEmail: ADMIN_EMAIL
      });

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? {
                ...item,
                shortlist_status: shortlistStatus,
                interview_date: shortlistStatus === 'shortlisted' ? getApplicationInterviewDate(application.id) : null,
                interview_status:
                  shortlistStatus === 'shortlisted' ? item.interview_status ?? 'not-held-yet' : item.interview_status
              }
            : item
        )
      );

      setApplicationMessage(
        application.id,
        'success',
        shortlistStatus === 'shortlisted'
          ? 'Candidate shortlisted and confirmation emails sent.'
          : 'Candidate marked as rejected.'
      );
    } catch (err) {
      setApplicationMessage(
        application.id,
        'error',
        err.message || 'Unable to update application decision.'
      );
    } finally {
      setLoading(false);
    }
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
              <button
                type="button"
                className={activeTab === 'group-iv-applications' ? 'is-active' : ''}
                onClick={() => setActiveTab('group-iv-applications')}
                disabled={loading}
              >
                Group IV Applications 2026
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

            {activeTab === 'group-iv-applications' ? (
              <section className="admin-events-list">
                <h2>Group IV Applications 2026</h2>
                {applicationsError ? (
                  <p className="admin-events-status admin-events-status--error">{applicationsError}</p>
                ) : null}
                {applications.length === 0 ? (
                  <p className="admin-events-empty">No applications submitted yet.</p>
                ) : null}
                {applications.map((application) => {
                  const isOpen = openApplicationId === application.id;
                  const statusMessage = applicationMessages[application.id];
                  const decisionDraft = applicationDecisionDrafts[application.id] ?? {
                    selectedDateOption: '',
                    customInterviewDate: ''
                  };
                  const isShortlisted = application.shortlist_status === 'shortlisted';

                  return (
                    <article
                      key={application.id}
                      className={`admin-events-item admin-application-item${isOpen ? ' is-open' : ''}`}
                    >
                      <div className="admin-application-summary">
                        <button
                          type="button"
                          className="admin-application-toggle"
                          onClick={() =>
                            setOpenApplicationId((current) => (current === application.id ? null : application.id))
                          }
                          aria-expanded={isOpen}
                          aria-controls={`group-iv-application-${application.id}`}
                        >
                          <span className={`admin-application-toggle__arrow${isOpen ? ' is-open' : ''}`} aria-hidden="true">
                            ▸
                          </span>
                          <span className="admin-application-toggle__name">
                            #{application.id} · {application.full_name}
                          </span>
                          <span className="admin-application-toggle__meta">
                            {application.gender} · Applied on {formatDate(application.created_at.split('T')[0])}
                          </span>
                        </button>

                        <div className="admin-application-actions">
                          {!isShortlisted ? (
                            <div className="admin-application-decision" onClick={(event) => event.stopPropagation()}>
                              <div className="admin-application-date-picker">
                                <span>Interview Date</span>
                                <select
                                  value={decisionDraft.selectedDateOption}
                                  onChange={(event) =>
                                    setApplicationDecisionDrafts((prev) => ({
                                      ...prev,
                                      [application.id]: {
                                        ...decisionDraft,
                                        selectedDateOption: event.target.value,
                                        customInterviewDate:
                                          event.target.value === 'custom' ? decisionDraft.customInterviewDate : ''
                                      }
                                    }))
                                  }
                                  disabled={loading}
                                >
                                  <option value="" disabled>
                                    Select interview date
                                  </option>
                                  {INTERVIEW_DATE_OPTIONS.map((dateValue) => (
                                    <option key={dateValue} value={dateValue}>
                                      {formatInterviewDate(dateValue)} ({interviewDateCounts[dateValue] ?? 0} shortlisted)
                                    </option>
                                  ))}
                                  <option value="custom">Custom date</option>
                                </select>
                                {decisionDraft.selectedDateOption === 'custom' ? (
                                  <input
                                    type="date"
                                    min={todayIso}
                                    value={decisionDraft.customInterviewDate}
                                    onChange={(event) =>
                                      setApplicationDecisionDrafts((prev) => ({
                                        ...prev,
                                        [application.id]: {
                                          ...decisionDraft,
                                          customInterviewDate: event.target.value
                                        }
                                      }))
                                    }
                                    disabled={loading}
                                  />
                                ) : null}
                              </div>
                              <div className="admin-application-decision-buttons">
                                <button
                                  type="button"
                                  onClick={() => handleApplicationDecision(application, 'shortlisted')}
                                  disabled={loading}
                                >
                                  Shortlist For Interview
                                </button>
                                <button
                                  type="button"
                                  className="admin-events-danger"
                                  onClick={() => handleApplicationDecision(application, 'rejected')}
                                  disabled={loading}
                                >
                                  Reject Candidate
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="admin-application-status-picker">
                              <span>Interview Status</span>
                              <select
                                value={application.interview_status}
                                onChange={(event) =>
                                  handleApplicationStatusChange(application.id, event.target.value)
                                }
                                disabled={loading}
                                onClick={(event) => event.stopPropagation()}
                              >
                                {INTERVIEW_STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          <span
                            className={`admin-booking-status admin-booking-status--application admin-booking-status--${
                              isShortlisted ? application.interview_status : application.shortlist_status ?? 'pending'
                            }`}
                          >
                            {isShortlisted
                              ? interviewStatusLabel(application.interview_status)
                              : shortlistStatusLabel(application.shortlist_status)}
                          </span>
                        </div>
                      </div>

                      {statusMessage ? (
                        <p
                          className={`admin-inline-status ${
                            statusMessage.type === 'error'
                              ? 'admin-inline-status--error'
                              : 'admin-inline-status--success'
                          }`}
                          aria-live="polite"
                        >
                          {statusMessage.message}
                        </p>
                      ) : null}

                      {isOpen ? (
                        <div
                          id={`group-iv-application-${application.id}`}
                          className="admin-application-details"
                        >
                          <p><strong>Application ID:</strong> {application.id}</p>
                          <p><strong>Date of Birth:</strong> {formatDate(application.date_of_birth)}</p>
                          <p><strong>Permanent Address:</strong> {application.permanent_address}</p>
                          <p><strong>City:</strong> {application.city} · <strong>Pincode:</strong> {application.pincode}</p>
                          <p><strong>Email:</strong> {application.email} · <strong>Contact:</strong> {application.contact_number}</p>
                          <p><strong>Aadhar Number:</strong> {application.aadhar_number}</p>
                          <p><strong>Annual Family Income (INR):</strong> {application.annual_family_income_inr}</p>
                          <p><strong>Parent Contact Number:</strong> {application.parent_contact_number}</p>
                          <p><strong>Educational Qualification:</strong> {application.educational_qualification}</p>
                          <p><strong>Community:</strong> {application.community}</p>
                          <p><strong>Mother's Name:</strong> {application.mother_name}</p>
                          <p><strong>Mother's Occupation:</strong> {application.mother_occupation || 'Not provided'}</p>
                          <p><strong>Father's Name:</strong> {application.father_name}</p>
                          <p><strong>Father's Occupation:</strong> {application.father_occupation || 'Not provided'}</p>
                          <p><strong>Shortlist Decision:</strong> {shortlistStatusLabel(application.shortlist_status)}</p>
                          {application.interview_date ? (
                            <p><strong>Interview Date:</strong> {formatInterviewDate(application.interview_date)}</p>
                          ) : null}
                          <p>
                            <strong>Previous TNPSC Examinations:</strong>{' '}
                            {application.tnpsc_exams?.length ? application.tnpsc_exams.join(', ') : 'None mentioned'}
                          </p>
                          <p>
                            <strong>Previously attended Ambedkar Academy coaching:</strong>{' '}
                            {application.previous_coaching ? 'Yes' : 'No'}
                          </p>
                          {application.previous_coaching ? (
                            <p><strong>Previous Coaching Year:</strong> {application.previous_coaching_year}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </section>
            ) : null}
          </>
        )}

      </section>
    </main>
  );
}
