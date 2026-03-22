import bookImage from '../assets/book.png';
import insideLeftCover from '../assets/inside-left-book-cover.png';
import insideRightCover from '../assets/inside-right-book-cover.png';
import fpBackImage from '../assets/fp-back.png';

export default function BookHero({
  wrapperRef,
  closedBookRef,
  flipPanelRef,
  openBookRef,
  onClosedClick,
  onLeftPageClick,
  onRightCoverClick
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
          <div className="left-half" onClick={onLeftPageClick}>
            <div className="left-cover">
              <img src={insideLeftCover} alt="" />
            </div>
            <div className="left-page" />
            <div className="left-content">
              <h1>About<br />Dr.&nbsp;Ambedkar<br />Academy</h1>
              <p className="close-hint">← click to close</p>
            </div>
          </div>

          <div className="spine">
          </div>

          <div className="right-cover" onClick={onRightCoverClick}>
            <img src={insideRightCover} alt="" />
          </div>

          <div className="right-page" />

          <div className="right-content">
            <div className="year-display">'70s</div>
            <p className="description">
              The People's Educational Trust – Dr. Ambedkar Academy is a unique
              organisation with the privilege of serving marginalised people for
              over 45 years. It blossomed from informal monthly gatherings of
              socially conscious intellectuals way back in the 1970s to discuss
              and deliberate on issues concerning the development of marginalised
              people.
            </p>
            <div className="next-btn" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4c2c1b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          <div className="tabs">
            <div className="tab"><span className="tab-inner">History</span></div>
            <div className="tab"><span className="tab-inner">Impact</span></div>
            <div className="tab"><span className="tab-inner">Members</span></div>
          </div>

          <div className="book-shadow" />
        </div>
      </div>
    </div>
  );
}
