const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Database Setup
const db = new sqlite3.Database("./database/database.db", (err) => {
  if (err) console.error(err);
  console.log("Connected to SQLite database.");
});

// Create Users Table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// Create Discussions Table
db.run(`
  CREATE TABLE IF NOT EXISTS discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animeId TEXT,
    user TEXT,
    message TEXT
  )
`);

// User Registration
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send("Error hashing password.");
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash], (err) => {
      if (err) return res.status(400).send("Username already exists.");
      res.redirect("/login.html");
    });
  });
});

// User Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(400).send("Invalid username or password.");
    bcrypt.compare(password, user.password, (err, result) => {
      if (!result) return res.status(400).send("Invalid password.");
      req.session.user = username;
      res.redirect("/");
    });
  });
});

// User Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

// Middleware to Check If Logged In
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login.html");
  next();
};

// Fetch Anime List
app.get("/anime", async (req, res) => {
  try {
    const { data } = await axios.get("https://fetch-manual-anime.vercel.app");
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching anime.");
  }
});

// Fetch Discussions
app.get("/discussions/:animeId", isAuthenticated, (req, res) => {
  db.all("SELECT * FROM discussions WHERE animeId = ?", [req.params.animeId], (err, rows) => {
    if (err) return res.status(500).send("Error fetching discussions.");
    res.json(rows);
  });
});

// Post a Discussion
app.post("/discussions", isAuthenticated, (req, res) => {
  const { animeId, message } = req.body;
  db.run("INSERT INTO discussions (animeId, user, message) VALUES (?, ?, ?)", [animeId, req.session.user, message], (err) => {
    if (err) return res.status(500).send("Error saving discussion.");
    res.redirect(`/discussion.html?animeId=${animeId}`);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    
