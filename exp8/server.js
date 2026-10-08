const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // parse JSON request bodies

// In-memory "database". Data resets whenever the server restarts.
let books = [
  { id: 1, title: "The Pragmatic Programmer", author: "Andrew Hunt", year: 1999, genre: "Technology" },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", year: 2008, genre: "Technology" },
];
let nextId = 3;

// Check the request body and return a list of problems (empty if valid).
// With partial = true (used by PATCH), missing fields are allowed.
function validateBook(body, partial = false) {
  const errors = [];
  const { title, author, year, genre } = body;

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || !title.trim()) errors.push("title is required and must be a non-empty string");
  }
  if (!partial || author !== undefined) {
    if (typeof author !== "string" || !author.trim()) errors.push("author is required and must be a non-empty string");
  }
  if (year !== undefined && (!Number.isInteger(year) || year < 0 || year > new Date().getFullYear())) {
    errors.push("year must be a whole number that is not in the future");
  }
  if (genre !== undefined && typeof genre !== "string") {
    errors.push("genre must be a string");
  }
  return errors;
}

// Look up the book from :id; respond with 404 if it doesn't exist.
function findBook(req, res) {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) res.status(404).json({ error: `Book with id ${req.params.id} not found` });
  return book;
}

// GET /books : list all books. Optional filters: ?author=...&genre=...&search=...
app.get("/books", (req, res) => {
  const { author, genre, search } = req.query;
  let result = books;

  if (author) result = result.filter((b) => b.author.toLowerCase().includes(author.toLowerCase()));
  if (genre) result = result.filter((b) => (b.genre || "").toLowerCase() === genre.toLowerCase());
  if (search) result = result.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  res.json(result);
});

// GET /books/:id : get one book
app.get("/books/:id", (req, res) => {
  const book = findBook(req, res);
  if (book) res.json(book);
});

// POST /books : create a book
app.post("/books", (req, res) => {
  const errors = validateBook(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { title, author, year, genre } = req.body;
  const book = { id: nextId++, title: title.trim(), author: author.trim(), year, genre };
  books.push(book);

  res.status(201).location(`/books/${book.id}`).json(book);
});

// PUT /books/:id : replace a book (all required fields must be sent)
app.put("/books/:id", (req, res) => {
  const book = findBook(req, res);
  if (!book) return;

  const errors = validateBook(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { title, author, year, genre } = req.body;
  Object.assign(book, { title: title.trim(), author: author.trim(), year, genre });
  res.json(book);
});

// PATCH /books/:id : update only the fields that are sent
app.patch("/books/:id", (req, res) => {
  const book = findBook(req, res);
  if (!book) return;

  const errors = validateBook(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  const { title, author, year, genre } = req.body;
  if (title !== undefined) book.title = title.trim();
  if (author !== undefined) book.author = author.trim();
  if (year !== undefined) book.year = year;
  if (genre !== undefined) book.genre = genre;
  res.json(book);
});

// DELETE /books/:id : remove a book
app.delete("/books/:id", (req, res) => {
  const book = findBook(req, res);
  if (!book) return;

  books = books.filter((b) => b.id !== book.id);
  res.status(204).send();
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler (also catches invalid JSON bodies)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`Book API running at http://localhost:${PORT}`));
