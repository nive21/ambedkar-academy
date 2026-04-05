import { forwardRef } from 'react';
import { BookHall } from './BookHall.jsx';

const Navbar = forwardRef(function Navbar({ onAcademyClick }, ref) {
  return (
    <nav className="navbar" ref={ref}>
      <a className="navbar-brand" href="/" aria-label="Dr. Ambedkar Academy home">
        <img className="navbar-brand__logo" src="/logo.png" alt="Dr. Ambedkar Academy logo" />
      </a>
      <a className="navbar-link" href="#academy" onClick={onAcademyClick}>About Dr.Ambedkar Academy</a>
      <a className="navbar-link" href="#services">Services</a>
      <a className="navbar-link" href="#events">Events</a>
      <BookHall className="events-book-btn--nav" />
    </nav>
  );
});

export default Navbar;
