const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to process JSON request data and serve static frontend files
app.use(express.json());
app.use(express.static(__dirname));
// In-memory data store for books
let books = [
  { id: 1, title: 'The White Tiger', author: 'Aravind Adiga', price: 399 },
  { id: 2, title: 'Malgudi Days', author: 'R.K. Narayan', price: 250 },
  { id: 3, title: 'Atomic Habits', author: 'James Clear', price: 499 }
];

// 1. GET /books - Retrieve all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// 2. GET /books/:id - Retrieve a particular book using book id
app.get('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const book = books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
  }

  res.status(200).json(book);
});

// 3. POST /books - Add a new book (Required for frontend Add functionality)
app.post('/books', (req, res) => {
  const { title, author, price } = req.body;

  if (!title || !author || price === undefined || price === '') {
    return res.status(400).json({ error: 'Title, author, and price are required.' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid positive number.' });
  }

  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const newBook = {
    id: newId,
    title: title.trim(),
    author: author.trim(),
    price: parsedPrice
  };

  books.push(newBook);
  res.status(201).json({ message: 'Book added successfully!', book: newBook });
});

// 4. POST /books/:id - Update book details (Matches your exact route specification)
app.post('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
  }

  const { title, author, price } = req.body;

  if (!title || !author || price === undefined || price === '') {
    return res.status(400).json({ error: 'Title, author, and price are required for updating.' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid positive number.' });
  }

  books[bookIndex] = {
    id: bookId,
    title: title.trim(),
    author: author.trim(),
    price: parsedPrice
  };

  res.status(200).json({ message: 'Book updated successfully!', book: books[bookIndex] });
});

// 5. DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: `Book with ID ${bookId} not found.` });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  res.status(200).json({ message: 'Book deleted successfully!', book: deletedBook });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
