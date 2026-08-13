import HomePage from './components/HomePage.jsx';
import BookHallPage from './components/BookHallPage.jsx';
import AdminEventsPage from './components/AdminEventsPage.jsx';
// import ApplyPage from './components/ApplyPage.jsx';
import ApplyClosedPage from './components/ApplyClosedPage.jsx';

export default function App() {
  const trimmedPath = window.location.pathname.replace(/\/+$/, '') || '/';

  if (trimmedPath === '/book-hall') {
    return <BookHallPage />;
  }

  if (trimmedPath === '/admin') {
    return <AdminEventsPage />;
  }

  if (trimmedPath === '/apply') {
    // return <ApplyPage />;
    return <ApplyClosedPage />;
  }

  return <HomePage />;
}
