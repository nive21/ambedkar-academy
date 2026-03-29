import HomePage from './components/HomePage.jsx';
import BookHallPage from './components/BookHallPage.jsx';

export default function App() {
  const trimmedPath = window.location.pathname.replace(/\/+$/, '') || '/';

  if (trimmedPath === '/book-hall') {
    return <BookHallPage />;
  }

  return <HomePage />;
}
