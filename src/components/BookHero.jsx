import bookImage from '../assets/book.png';
import insideLeftCover from '../assets/inside-left-book-cover.png';
import insideRightCover from '../assets/inside-right-book-cover.png';
import fpBackImage from '../assets/fp-back.png';

function normalizeTitle(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getPageTone(page) {
  const normalizedTitle = normalizeTitle(page?.title ?? '');
  if (normalizedTitle === 'gallery') {
    return { fill: '#D7B4A2' };
  }
  if (normalizedTitle === 'management') {
    return { fill: '#D5B3B2' };
  }
  if (normalizedTitle === 'about dr. ambedkar academy') {
    return { fill: '#CCCDC7' };
  }
  return {};
}

function BookPageImage({ imageSrc, imageAlt }) {
  if (!imageSrc) return null;

  return (
    <div className="book-image-placeholder" role="img" aria-label={imageAlt ?? 'Page image'}>
      {imageSrc === 'placeholder' ? <span>Image Placeholder</span> : <img src={imageSrc} alt={imageAlt ?? ''} />}
    </div>
  );
}

export default function BookHero({
  wrapperRef,
  closedBookRef,
  flipPanelRef,
  openBookRef,
  leftHalfRef,
  leftHalfVisible,
  onClosedClick,
  onCloseClick,
  onLeftPageClick,
  onRightCoverClick,
  leftPage,
  rightPage,
  showPrev,
  showNext,
  onPrev,
  onNext,
  tabs,
  activeTab,
  onTabClick,
  allowCloseOnLeft,
  onContinueClick
}) {
  const leftTone = getPageTone(leftPage);
  const rightTone = getPageTone(rightPage);
  const leftHalfStyle = {
    '--page-fill': leftTone.fill,
    '--page-ink': leftTone.ink
  };
  const rightSideStyle = {
    '--page-fill': rightTone.fill,
    '--page-ink': rightTone.ink
  };

  return (
    <div className="book-wrap" ref={wrapperRef}>
      <div className="book-scene">
        <div className="closed-book" ref={closedBookRef} onClick={onClosedClick}>
          <img src={bookImage} alt="Dr. Ambedkar Academy" />
          <span className="click-hint">Scroll or click to open</span>
        </div>

        <div className="flip-panel" ref={flipPanelRef}>
          <div className="fp-front">
            <img src={bookImage} alt="" />
          </div>
          <div className="fp-back">
            <img src={fpBackImage} alt="" />
          </div>
        </div>

        <div className="open-book" ref={openBookRef}>
          <div
            className={`left-half ${leftHalfVisible ? 'left-half-visible' : ''} ${allowCloseOnLeft ? 'is-closable' : 'is-prev-only'}`}
            ref={leftHalfRef}
            onClick={allowCloseOnLeft ? onLeftPageClick : undefined}
            style={leftHalfStyle}
          >
            <div className="left-cover">
              <img src={insideLeftCover} alt="" />
            </div>
            <div className="left-page" />
            <div className="left-content">
              {leftPage.title ? <h1 className="page-title" dangerouslySetInnerHTML={{ __html: leftPage.title }} /> : null}
              {leftPage.yearTitle ? <div className="year-display year-display--left">{leftPage.yearTitle}</div> : null}
              <BookPageImage imageSrc={leftPage.imageSrc} imageAlt={leftPage.imageAlt} />
              {leftPage.subTitle ? <p className="page-subtitle">{leftPage.subTitle}</p> : null}
              {leftPage.body ? <p className="left-body">{leftPage.body}</p> : null}
              {allowCloseOnLeft ? <p className="close-hint">← click to close</p> : null}
            </div>
            {showPrev ? (
              <button
                type="button"
                className="prev-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onPrev?.();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 5 5 12 12 19" />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="spine" />

          <div className="right-cover" onClick={onRightCoverClick}>
            <img src={insideRightCover} alt="" />
          </div>

          <div className="right-page" style={rightSideStyle} />

          <div className="right-content" style={rightSideStyle}>
            {rightPage.title ? <h2 className="page-title page-title--right">{rightPage.title}</h2> : null}
            {rightPage.yearTitle ? <div className="year-display">{rightPage.yearTitle}</div> : null}
            <BookPageImage imageSrc={rightPage.imageSrc} imageAlt={rightPage.imageAlt} />
            {rightPage.subTitle ? <p className="page-subtitle">{rightPage.subTitle}</p> : null}
            {rightPage.body ? <p className={`description ${rightPage.imageSrc ? 'description--wide' : ''}`}>{rightPage.body}</p> : null}
            {showNext ? (
              <button type="button" className="next-btn" onClick={onNext}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab ${activeTab === tab.id ? 'is-selected' : ''}`}
                onClick={() => onTabClick?.(tab.id)}
              >
                <span className="tab-inner">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="book-shadow" />
        </div>

        <button
          type="button"
          className="book-scroll-indicator"
          onClick={(event) => {
            event.stopPropagation();
            onContinueClick?.();
          }}
          aria-label="Scroll to the next section"
        >
          <span className="book-scroll-indicator__label">Scroll to learn more</span>
          <span className="book-scroll-indicator__arrow" aria-hidden="true">
            <span className="book-scroll-indicator__head book-scroll-indicator__head--left line-brush-h" />
            <span className="book-scroll-indicator__head book-scroll-indicator__head--right line-brush-h" />
          </span>
        </button>
      </div>
    </div>
  );
}
