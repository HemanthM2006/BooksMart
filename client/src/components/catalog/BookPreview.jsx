import { useEffect, useRef } from "react";
import BookCover from "./BookCover";

export default function BookPreview({ book, saved, onSave, onAdd, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog ref={dialog} className="preview" aria-labelledby="preview-title" onCancel={onClose}
      onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      <div className="preview-body">
        <button className="preview-close" onClick={onClose} aria-label="Close preview">×</button>
        <BookCover book={book} />
        <div className="preview-copy">
          <p className="book-category">{book.category}</p>
          <h2 id="preview-title">{book.title}</h2>
          <p className="author">By {book.author}</p>
          <p className="synopsis">{book.description || "No description available."}</p>
          <p>₹{book.price} · {book.stock ? `${book.stock} in stock` : "Sold out"}</p>
          <div className="preview-actions">
            <button className="cart-button" disabled={!book.stock} onClick={() => { onAdd(book); onClose(); }}>Add to cart</button>
            <button className="list-toggle" aria-pressed={saved} onClick={() => onSave(book._id)}>{saved ? "Saved to reading list" : "Save to reading list"}</button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
