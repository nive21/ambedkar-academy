import { forwardRef } from 'react';
import { BookHall } from './BookHall.jsx';

const Navbar = forwardRef(function Navbar(_, ref) {
  return (
    <nav className="navbar" ref={ref}>
      <a className="navbar-brand" href="/" aria-label="Dr. Ambedkar Academy home">
        <img className="navbar-brand__logo" src="/logo.png" alt="Dr. Ambedkar Academy logo" />
      </a>
      <a className="navbar-link" href="#academy">The Academy</a>
      <a className="navbar-link" href="#events">Events</a>
      <a className="navbar-link" href="#members">Members</a>
      <BookHall className="events-book-btn--nav" />
    </nav>
  );
});

export default Navbar;
