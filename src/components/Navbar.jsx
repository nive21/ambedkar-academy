import { forwardRef } from 'react';

const Navbar = forwardRef(function Navbar(_, ref) {
  return (
    <nav className="navbar" ref={ref}>
      <a href="#academy">The Academy</a>
      <a href="#events">Events / Book Hall</a>
      <a href="#members">Members</a>
    </nav>
  );
});

export default Navbar;
