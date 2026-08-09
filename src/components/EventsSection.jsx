import { useEffect, useMemo, useState } from 'react';
import { BookHall } from './BookHall';
import { ApplyForCoaching } from './ApplyForCoaching';
import { supabase } from '../lib/supabaseClient';

const EVENTS_PER_PAGE = 3;

function formatDateForCard(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatTimeLabel(timeValue) {
  const [hoursStr, minutesStr] = timeValue.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = ((hours + 11) % 12) + 1;
  if (minutes === 0) {
    return `${displayHour} ${suffix}`;
  }
  return `${displayHour}:${minutesStr} ${suffix}`;
}

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      const todayIso = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('admin_events')
        .select('id, event_date, start_time, end_time, event_type, description')
        .gte('event_date', todayIso)
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (!active) return;

      if (error) {
        setLoadError('Unable to load events right now.');
        setEvents([]);
        return;
      }

      const rows = (data ?? []).map((eventItem) => ({
        id: eventItem.id,
        date: formatDateForCard(eventItem.event_date),
        time: `${formatTimeLabel(eventItem.start_time)} – ${formatTimeLabel(eventItem.end_time)}: ${eventItem.event_type}`,
        desc: eventItem.description
      }));

      setEvents(rows);
      setPage(0);
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleEvents = useMemo(() => {
    const start = currentPage * EVENTS_PER_PAGE;
    return events.slice(start, start + EVENTS_PER_PAGE);
  }, [events, currentPage]);

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <section className="events-section" id="events">
      <div className="hori-line events-line-h line-brush-h" />
      <div className="events-inner">
        <div className="events-layout">
          <div className="events-page" aria-label="Upcoming events">
            <div className="events-card">
              {/* <BookHall /> */}
              <ApplyForCoaching />

              <div className="events-title">
                <p>Upcoming</p>
                <p>Events</p>
              </div>

              <div className="events-container">
                {loadError ? <p className="events-desc events-error">{loadError}</p> : null}
                {!loadError && visibleEvents.length === 0 ? (
                  <div className="events-row-group">
                    <div className="events-divider" />
                    <div className="events-row">
                      <p className="events-date">--</p>
                      <p className="events-time">No upcoming events</p>
                      <p className="events-desc">Administrative events added by the admin will appear here.</p>
                    </div>
                  </div>
                ) : null}
                {visibleEvents.map((event) => (
                  <div className="events-row-group" key={`${event.id}-${event.time}`}>
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
                <button
                  className="events-next-btn events-prev-btn"
                  disabled={!hasPrev}
                  aria-disabled={!hasPrev}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  Prev
                </button>
                <button
                  className="events-next-btn"
                  disabled={!hasNext}
                  aria-disabled={!hasNext}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="events-address">
            <p>The People&apos;s Educational Trust – Dr. Ambedkar Academy:</p>
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
