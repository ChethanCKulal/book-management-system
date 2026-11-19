const bookForm = document.getElementById('book-form');
const formTitle = document.getElementById('form-title');
const bookIdInput = document.getElementById('book-id');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const bookList = document.getElementById('book-list');
const statusMessage = document.getElementById('status-message');

const searchIdInput = document.getElementById('search-id');
const searchBtn = document.getElementById('search-btn');
const resetSearchBtn = document.getElementById('reset-search-btn');

// Display status or error messages
function showMessage(text, isError = false) {
  statusMessage.textContent = text;
  statusMessage.className = isError ? 'status-error' : 'status-success';
  setTimeout(() => {
    statusMessage.className = 'status-hidden';
  }, 4000);
}

// Render books into the HTML table
function renderBooks(books) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    bookList.innerHTML = '<tr><td colspan="5">No books available.</td></tr>';
    return;
  }

  books.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>₹${book.price.toFixed(2)}</td>
      <td>
        <button class="edit-btn" onclick="startEdit(${book.id}, '${book.title.replace(/'/g, "\\'")}', '${book.author.replace(/'/g, "\\'")}', ${book.price})">Edit</button>
        <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
      </td>
    `;
    bookList.appendChild(row);
  });
}

// 1. Fetch all books (GET /books)
async function fetchBooks() {
  try {
    const response = await fetch('/books');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch books');
    }

    renderBooks(data);
  } catch (error) {
    showMessage(error.message, true);
  }
}

// 2. Fetch a single book by ID (GET /books/:id)
searchBtn.addEventListener('click', async () => {
  const id = searchIdInput.value.trim();
  if (!id) {
    showMessage('Please enter a Book ID to search.', true);
    return;
  }

  try {
    const response = await fetch(`/books/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Book not found');
    }

    renderBooks([data]);
    showMessage(`Found book: "${data.title}"`);
  } catch (error) {
    showMessage(error.message, true);
  }
});

resetSearchBtn.addEventListener('click', () => {
  searchIdInput.value = '';
  fetchBooks();
});

// 3 & 4. Add (POST /books) or Update (POST /books/:id) a book
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = bookIdInput.value;
  const bookData = {
    title: titleInput.value,
    author: authorInput.value,
    price: parseFloat(priceInput.value)
  };

  // If id exists, call POST /books/:id to update; otherwise POST /books to create
  const url = id ? `/books/${id}` : '/books';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Operation failed');
    }

    showMessage(data.message);
    resetForm();
    fetchBooks();
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Populate form for editing
function startEdit(id, title, author, price) {
  bookIdInput.value = id;
  titleInput.value = title;
  authorInput.value = author;
  priceInput.value = price;

  formTitle.textContent = `Edit Book (ID: ${id})`;
  submitBtn.textContent = 'Update Book';
  cancelBtn.classList.remove('hidden');
}

// Reset form back to Add mode
function resetForm() {
  bookForm.reset();
  bookIdInput.value = '';
  formTitle.textContent = 'Add New Book';
  submitBtn.textContent = 'Add Book';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// 5. Delete a book (DELETE /books/:id)
async function deleteBook(id) {
  if (!confirm(`Are you sure you want to delete Book ID ${id}?`)) return;

  try {
    const response = await fetch(`/books/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete book');
    }

    showMessage(data.message);
    fetchBooks();
  } catch (error) {
    showMessage(error.message, true);
  }
}

// Load books when page opens
fetchBooks();
