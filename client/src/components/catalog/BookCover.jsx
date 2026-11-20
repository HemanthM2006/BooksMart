import { useState } from "react";

export default function BookCover({ book }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const palette = book.title.length % 3;
  return (
    <div className={`book-cover cover-tone-${palette}`}>
      {book.imageUrl && book.imageUrl !== failedUrl ? (
        <img src={book.imageUrl} alt="" loading="lazy" onError={() => setFailedUrl(book.imageUrl)} />
      ) : (
        <div className="jacket" aria-hidden="true">
          <small>{book.category}</small>
          <strong>{book.title}</strong>
          <i />
          <span>{book.author}</span>
        </div>
      )}
    </div>
  );
}
