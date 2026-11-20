import { useEffect, useState } from "react";


import useStoredList from "../hooks/useStoredList";
import StorefrontHero from "../components/catalog/StorefrontHero";
import BookForm from "../components/catalog/BookForm";
import BookPreview from "../components/catalog/BookPreview";
import BookCard from "../components/catalog/BookCard";
import CartDrawer from "../components/catalog/CartDrawer";

const API = "/api/books";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: ""
};

function CatalogPage({ role, onLogout }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useStoredList("booksmart-cart");
  const [saved, setSaved] = useStoredList("booksmart-reading-list");
  const [savedOnly, setSavedOnly] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [preview, setPreview] = useState(null);

  function toggleSaved(id) {
    setSaved((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setInStock(false);
    setSavedOnly(false);
  }

  const [message, setMessage] = useState("");

  // Fetch books from backend
  const fetchBooks = (signal) =>
    fetch(API, { signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to fetch books");
        return response.json();
      })
      .then((data) => {
        setBooks(data);
        setError("");
      })
      .catch((err) => {
        if (!signal?.aborted) setError(err.message);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });

  useEffect(() => {
    const controller = new AbortController();
    fetchBooks(controller.signal);
    return () => controller.abort();
  }, []);

  // Categories
  const categories = [
    "All",
    ...new Set(books.map((book) => book.category))
  ];

  // Search, filter and sort
  const filteredBooks = books
    .filter((book) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term);

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory && (!savedOnly || saved.includes(book._id)) && (!inStock || book.stock > 0);
    })
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  // Handle form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Open add form
  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  // Open edit form
  const openEditForm = (book) => {
    setEditingId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      category: book.category,
      stock: book.stock,
      imageUrl: book.imageUrl || ""
    });
    setShowForm(true);
    setMessage("");
    setShowCart(false);
  };

  // Add or update book
  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookData = {
      ...formData,
      title: formData.title.trim(),
      author: formData.author.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock)
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bookData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(
        editingId
          ? "Book updated successfully!"
          : "Book added successfully!"
      );

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);

      setLoading(true);
      await fetchBooks();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Delete book
  const deleteBook = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setCart((current) => current.filter((item) => item._id !== id));
      setSaved((ids) => ids.filter((item) => item !== id));
      setMessage("Book deleted successfully!");

      setLoading(true);
      await fetchBooks();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Add to cart
  const addToCart = (book) => {
    if (book.stock <= 0) return;

    setCart((current) => {
      const existing = current.find(
        (item) => item._id === book._id
      );

      if (existing) {
        if (existing.quantity >= book.stock) {
          setMessage("Maximum available stock reached!");
          return current;
        }

        return current.map((item) =>
          item._id === book._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...book, quantity: 1 }];
    });

    setMessage(`${book.title} added to cart!`);
  };

  // Change cart quantity
  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item._id !== id) return item;

          const book = books.find((b) => b._id === id);
          const maxStock = book ? book.stock : item.stock;
          const quantity = item.quantity + amount;

          if (quantity > maxStock) return item;

          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item._id !== id)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar" onClick={(event) => { if (event.target.closest('a[href^="#"]')) setShowForm(false); }}>
        <a href="#home" className="logo">
          Books<span>Mart.</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#books">Explore Books</a>
          <a href="#categories">Categories</a>
        </div>

        <div className="nav-actions">
          {role ? (
            <button className="cart-button" onClick={onLogout}>Sign out</button>
          ) : (
            <a href="/login">Sign in</a>
          )}
          {role === "admin" && <button className="add-book-button" onClick={openAddForm}>
            + Add Book
          </button>}

          <button
            className="cart-button"
            onClick={() => setShowCart(true)}
          >
            Cart ({cartCount})
          </button>
        </div>
      </nav>

      {/* Notifications */}
      {message && (
        <div className="status-message" role="status">
          <span>{message}</span>
          <button aria-label="Dismiss notification" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* Add / Edit Book Form */}
      {role === "admin" && showForm ? (
        <BookForm editingId={editingId} formData={formData} handleChange={handleChange}
          handleSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          <StorefrontHero />

          {/* Books */}
          <main>
            <section className="books-section" id="books">

              <div className="section-heading">
                <div>
                  <h2>{savedOnly ? "Your reading list" : "The collection"}</h2>
                </div>

                {!loading && !error && <span>{filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}</span>}
              </div>

              <input
                className="search-input" type="search" aria-label="Search by title or author"
                placeholder="Search by book title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="filter-row">
                <div className="categories" id="categories">
                  {categories.map((item) => (
                    <button
                      key={item}
                      className={category === item ? "active" : ""}
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <select
                  className="sort-select" aria-label="Sort books"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title">Title: A to Z</option>
                </select>
              </div>

              <div className="shelf-filters">
                <button className="list-toggle" onClick={() => setSavedOnly(!savedOnly)} aria-pressed={savedOnly}>
                  ♡ Reading list ({books.filter((book) => saved.includes(book._id)).length})
                </button>
                <label><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
                {(search || category !== "All" || inStock || savedOnly) && <button className="reset" onClick={resetFilters}>Clear filters</button>}
              </div>
              {loading ? (
                <p className="empty-message">Loading books...</p>
              ) : error ? (
                <p className="empty-message">{error}</p>
              ) : (
                <div className="book-grid">
                  {filteredBooks.map((book) => (
                    <BookCard key={book._id} book={book} saved={saved.includes(book._id)} onSave={toggleSaved}
                      onPreview={setPreview} onAdd={addToCart} isAdmin={role === "admin"}
                      onEdit={openEditForm} onDelete={deleteBook} />
                  ))}
                </div>
              )}

              {!loading && !error && filteredBooks.length === 0 && (
                <p className="empty-message">
                  {savedOnly && !saved.length ? "Your reading list is empty. Use the heart on a book to save it here." : "No books match your selection."}
                </p>
              )}
            </section>
          </main>
        </>
      )}

      {/* Shopping Cart */}
      {showCart && <CartDrawer cart={cart} cartTotal={cartTotal} changeQuantity={changeQuantity}
        removeFromCart={removeFromCart} onClose={() => setShowCart(false)} />}
      {preview && <BookPreview book={preview} saved={saved.includes(preview._id)} onSave={toggleSaved}
        onAdd={addToCart} onClose={() => setPreview(null)} />}

      {/* Footer */}
      <footer>
        <h2>BooksMart.</h2>

        <p>© 2026 BooksMart. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default CatalogPage;
