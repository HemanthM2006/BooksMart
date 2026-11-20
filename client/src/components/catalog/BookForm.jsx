export default function BookForm({ editingId, formData, handleChange, handleSubmit, onCancel }) {
  return (
    <section className="add-book-section">
          <p className="eyebrow">BOOK MANAGEMENT</p>

          <h2>{editingId ? "Edit Book" : "Add a New Book"}</h2>

          <p className="form-description">
            {editingId
              ? "Update the details of your book."
              : "Enter the details of the book you want to list."}
          </p>

          <form className="book-form" onSubmit={handleSubmit}>
            <label htmlFor="book-title">Book Title</label>
            <input
              name="title" id="book-title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={120}
              placeholder="Enter book title"
            />

            <label htmlFor="book-author">Author</label>
            <input
              name="author" id="book-author"
              value={formData.author}
              onChange={handleChange}
              required
              maxLength={80}
              placeholder="Enter author name"
            />

            <label htmlFor="book-description">Description</label>
            <textarea
              name="description" id="book-description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={1000}
              placeholder="Enter book description"
            />

            <div className="form-row">
              <div>
                <label htmlFor="book-price">Price (₹)</label>
                <input
                  type="number"
                  name="price" id="book-price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="book-stock">Stock</label>
                <input
                  type="number"
                  name="stock" id="book-stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <label htmlFor="book-category">Category</label>
            <input
              name="category" id="book-category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g. Fiction, Technology"
            />

            <label htmlFor="book-imageUrl">Book Cover Image URL</label>
            <input
              type="url"
              name="imageUrl" id="book-imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/book.jpg"
            />

            <div className="form-actions">
              <button type="submit" className="submit-book-button">
                {editingId ? "Save Changes" : "Add Book"}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
  );
}
