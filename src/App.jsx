import HomePage from './components/HomePage.jsx';
import BookHallPage from './components/BookHallPage.jsx';
import AdminEventsPage from './components/AdminEventsPage.jsx';
import ApplyPage from './components/ApplyPage.jsx';

export default function App() {
  const trimmedPath = window.location.pathname.replace(/\/+$/, '') || '/';

  if (trimmedPath === '/book-hall') {
    return <BookHallPage />;
  }

  if (trimmedPath === '/admin') {
    return <AdminEventsPage />;
  }

  if (trimmedPath === '/apply') {
    return <ApplyPage />;
  }

  return <HomePage />;
}
