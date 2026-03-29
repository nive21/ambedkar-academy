import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function defaultFormState() {
  return {
    eventDate: '',
    startTime: '',
    endTime: '',
    eventType: '',
    description: ''
  };
}

export default function AdminEventsPage() {
  const [accessKey, setAccessKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [events, setEvents] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [newEvent, setNewEvent] = useState(defaultFormState());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  async function callAdminEvents(action, payload = {}) {
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

  async function loadEvents() {
    setLoading(true);
    setError('');
    try {
      const response = await callAdminEvents('list');
      const records = response?.events ?? [];
      setEvents(records);
      setDrafts(
        records.reduce((acc, event) => {
          acc[event.id] = {
            eventDate: event.event_date,
            startTime: event.start_time,
            endTime: event.end_time,
            eventType: event.event_type,
            description: event.description
          };
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthorized) return;
    loadEvents();
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

  async function handleUnlock(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!accessKey.trim()) {
      setError('Please enter admin access key.');
      return;
    }
    setIsAuthorized(true);
  }

  async function handleCreateEvent(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateEventPayload(newEvent);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await callAdminEvents('create', {
        event: {
          eventDate: newEvent.eventDate,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          eventType: newEvent.eventType.trim(),
          description: newEvent.description.trim()
        }
      });
      setNewEvent(defaultFormState());
      setSuccess('Administrative event created.');
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Unable to create event.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEvent(eventId) {
    setError('');
    setSuccess('');
    const draft = drafts[eventId];
    const validationError = validateEventPayload(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await callAdminEvents('update', {
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
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Unable to update event.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEvent(eventId) {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await callAdminEvents('delete', { id: eventId });
      setSuccess('Event deleted.');
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Unable to delete event.');
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
        <h1>Administrative Events</h1>
        <p>
          Add, update, or delete hall-blocking events with custom timings. These events will also
          appear in the home page events section.
        </p>

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

            <section className="admin-events-list">
              <h2>Manage Events</h2>
              {events.length === 0 ? <p className="admin-events-empty">No events yet.</p> : null}
              {events.map((eventItem) => {
                const draft = drafts[eventItem.id] ?? {
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
                            setDrafts((prev) => ({
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
                            setDrafts((prev) => ({
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
                            setDrafts((prev) => ({
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
                          setDrafts((prev) => ({
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
                          setDrafts((prev) => ({
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
        )}

        {error ? <p className="admin-events-status admin-events-status--error">{error}</p> : null}
        {success ? <p className="admin-events-status admin-events-status--success">{success}</p> : null}
      </section>
    </main>
  );
}
