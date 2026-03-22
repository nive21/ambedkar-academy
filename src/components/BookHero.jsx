import bookImage from '../assets/book.png';
import insideLeftCover from '../assets/inside-left-book-cover.png';
import insideRightCover from '../assets/inside-right-book-cover.png';
import fpBackImage from '../assets/fp-back.png';

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
  allowCloseOnLeft
}) {
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
          >
            <div className="left-cover">
              <img src={insideLeftCover} alt="" />
            </div>
            <div className="left-page" />
            <div className="left-content">
              <h1 dangerouslySetInnerHTML={{ __html: leftPage.title }} />
              {leftPage.body ? <p className="left-body">{leftPage.body}</p> : null}
              {showPrev ? (
                <button
                  type="button"
                  className="prev-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPrev?.();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4c2c1b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 5 5 12 12 19" />
                  </svg>
                </button>
              ) : null}
              {allowCloseOnLeft ? <p className="close-hint">← click to close</p> : null}
            </div>
          </div>

          <div className="spine" />

          <div className="right-cover" onClick={onRightCoverClick}>
            <img src={insideRightCover} alt="" />
          </div>

          <div className="right-page" />

          <div className="right-content">
            <div className="year-display">{rightPage.title}</div>
            <p className="description">{rightPage.body}</p>
            {showNext ? (
              <button type="button" className="next-btn" onClick={onNext}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4c2c1b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          className="click-close"
          onClick={(event) => {
            event.stopPropagation();
            onCloseClick?.();
          }}
        >
          Click to close
        </button>
      </div>
    </div>
  );
}
