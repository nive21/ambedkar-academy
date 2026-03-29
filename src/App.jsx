import HomePage from './components/HomePage.jsx';
import BookHallPage from './components/BookHallPage.jsx';
import AdminEventsPage from './components/AdminEventsPage.jsx';

export default function App() {
  const trimmedPath = window.location.pathname.replace(/\/+$/, '') || '/';

  if (trimmedPath === '/book-hall') {
    return <BookHallPage />;
  }

  if (trimmedPath === '/admin-events') {
    return <AdminEventsPage />;
  }

  return <HomePage />;
}
