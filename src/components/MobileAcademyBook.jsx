import { useMemo, useState } from 'react';
import { ACADEMY_TABS } from '../content/academyContent.js';

const NOTE_COLORS = ['#CCCDC7', '#D7B4A2', '#D5B3B2'];

function stripHtml(value = '') {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function flattenTabPages(tab) {
  return tab.pages.flatMap((spread) => [spread.left, spread.right]);
}

function MobileBookEntry({ entry, className = '' }) {
  return (
    <section className={['mobile-book-entry', className].filter(Boolean).join(' ')}>
      {entry.title ? <h4 className="mobile-book-entry__title">{stripHtml(entry.title)}</h4> : null}
      {entry.yearTitle ? <div className="mobile-book-entry__year">{entry.yearTitle}</div> : null}
      {entry.imageSrc ? (
        <div className="mobile-book-entry__image" role="img" aria-label={entry.imageAlt ?? 'Image placeholder'}>
          {entry.imageSrc === 'placeholder' ? <span>Image Placeholder</span> : <img src={entry.imageSrc} alt={entry.imageAlt ?? ''} />}
        </div>
      ) : null}
      {entry.subTitle ? <p className="mobile-book-entry__subtitle">{entry.subTitle}</p> : null}
      {entry.body ? <p className="mobile-book-entry__body">{entry.body}</p> : null}
    </section>
  );
}

export default function MobileAcademyBook() {
  const [activeTabId, setActiveTabId] = useState(ACADEMY_TABS[0]?.id ?? '');
  const [pageIndex, setPageIndex] = useState(0);

  const activeTab = useMemo(
    () => ACADEMY_TABS.find((tab) => tab.id === activeTabId) ?? ACADEMY_TABS[0],
    [activeTabId]
  );

  const activeTabIndex = Math.max(0, ACADEMY_TABS.findIndex((tab) => tab.id === activeTab?.id));
  const pages = activeTab ? flattenTabPages(activeTab) : [];
  const activePage = pages[pageIndex] ?? pages[0];
  const canGoPrev = pageIndex > 0 || activeTabIndex > 0;
  const canGoNext = pageIndex < pages.length - 1 || activeTabIndex < ACADEMY_TABS.length - 1;
  const isSectionIntroPage = pageIndex === 0;

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex((current) => current - 1);
      return;
    }

    if (activeTabIndex > 0) {
      const previousTab = ACADEMY_TABS[activeTabIndex - 1];
      const previousPages = flattenTabPages(previousTab);
      setActiveTabId(previousTab.id);
      setPageIndex(Math.max(previousPages.length - 1, 0));
    }
  };

  const handleNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex((current) => current + 1);
      return;
    }

    if (activeTabIndex < ACADEMY_TABS.length - 1) {
      const nextTab = ACADEMY_TABS[activeTabIndex + 1];
      setActiveTabId(nextTab.id);
      setPageIndex(0);
    }
  };

  return (
    <div className="mobile-academy-book" aria-label="Dr. Ambedkar Academy book">
      <div className="mobile-academy-book__tabs" role="tablist" aria-label="Academy book sections">
        {ACADEMY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab?.id === tab.id}
            className={`mobile-academy-book__tab ${activeTab?.id === tab.id ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTabId(tab.id);
              setPageIndex(0);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mobile-academy-book__stack">
        <div className="mobile-academy-book__shadow" aria-hidden="true" />
        <div className="mobile-academy-book__sheet mobile-academy-book__sheet--back" aria-hidden="true" />
        <div className="mobile-academy-book__sheet mobile-academy-book__sheet--mid" aria-hidden="true" />
        <article
          className="mobile-academy-book__sheet mobile-academy-book__sheet--front"
          style={{ '--mobile-book-fill': NOTE_COLORS[activeTabIndex % NOTE_COLORS.length] }}
        >
          <div className="mobile-academy-book__header">
            <p className="mobile-academy-book__section">{activeTab?.label}</p>
            <p className="mobile-academy-book__pagination">
              {String(pageIndex + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
            </p>
          </div>

          <div className="mobile-academy-book__content">
            {activePage ? (
              <MobileBookEntry
                className={isSectionIntroPage ? 'is-centered' : ''}
                key={activePage.title ?? activePage.yearTitle ?? activePage.subTitle ?? activePage.body}
                entry={activePage}
              />
            ) : null}
          </div>

          <div className="mobile-academy-book__controls">
            <button
              type="button"
              className="mobile-academy-book__control"
              onClick={handlePrev}
              aria-label="Previous academy page"
              disabled={!canGoPrev}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 5 5 12 12 19" />
              </svg>
            </button>
            <button
              type="button"
              className="mobile-academy-book__control"
              onClick={handleNext}
              aria-label="Next academy page"
              disabled={!canGoNext}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
