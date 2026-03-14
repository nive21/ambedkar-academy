import bookImage from '../assets/book.png';

export default function BookHero({ bookRef }) {
  return (
    <div className="book-wrap" ref={bookRef}>
      <div className="book-inner">
          <img src={bookImage} alt="Dr. Ambedkar Academy cover" />
      </div>
    </div>
  );
}
