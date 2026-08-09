import { ApplyForCoaching } from './ApplyForCoaching.jsx';
import MobileAcademyBook from './MobileAcademyBook.jsx';
import { ACADEMY_MISSION_TEXT, ACADEMY_VISION_TEXT } from '../content/academyContent.js';

export default function MobileAcademyIntro() {
  return (
    <section className="mobile-academy" aria-labelledby="mobile-academy-title">
      <div className="mobile-academy__inner">
        <ApplyForCoaching className="mobile-academy__apply" />

        <div className="mobile-academy__eyebrow" id="mobile-academy-title">
          <img className="mobile-academy__logo" src="/logo.png" alt="" aria-hidden="true" />
          <p className="mobile-academy__eyebrow-text">Dr. Ambedkar Academy</p>
        </div>

        <MobileAcademyBook />

        <div className="mobile-academy__panel">
          <h2 className="mobile-academy__heading">Vision</h2>
          <p className="mobile-academy__body">{ACADEMY_VISION_TEXT}</p>
        </div>

        <div className="mobile-academy__panel">
          <h2 className="mobile-academy__heading">Mission</h2>
          <p className="mobile-academy__body">{ACADEMY_MISSION_TEXT}</p>
        </div>
      </div>
    </section>
  );
}
