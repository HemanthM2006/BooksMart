import BookCover from "./BookCover";

export default function BookCard({ book, saved, onSave, onPreview, onAdd, isAdmin, onEdit, onDelete }) {
  return (
    <article className="book-card">
      <button className="cover-button" onClick={() => onPreview(book)} aria-label={`Preview ${book.title}`}>
        <BookCover book={book} />
      </button>
      <button className="save-book" aria-pressed={saved} aria-label={`Save ${book.title}`} onClick={() => onSave(book._id)}>
        <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      </button>
      <div className="book-info">
        <span className="book-category">{book.category}</span>
        <h3><button className="title-link" onClick={() => onPreview(book)}>{book.title}</button></h3>
        <p className="author">{book.author}</p>
        <div className="book-bottom">
          <strong>₹{book.price}</strong>
          <button disabled={!book.stock} onClick={() => onAdd(book)}>{book.stock ? "Add to cart" : "Sold out"}</button>
        </div>
        {isAdmin && <div className="management-actions">
          <button onClick={() => onEdit(book)}>Edit</button>
          <button className="delete-button" onClick={() => onDelete(book._id)}>Delete</button>
        </div>}
      </div>
    </article>
  );
}
