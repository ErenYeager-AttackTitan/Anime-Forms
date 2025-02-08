const express = require("express");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./discussions.db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Create discussions table
db.run(`
    CREATE TABLE IF NOT EXISTS discussions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anime_id TEXT,
        name TEXT,
        message TEXT
    )
`);

// Fetch anime list from API
app.get("/anime", async (req, res) => {
    try {
        const response = await axios.get("https://fetch-manual-anime.vercel.app");
        const animeList = response.data.map(anime => ({
            animeId: anime.animeId,
            posterUrl: anime.posterUrl
        }));
        res.json(animeList);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch anime" });
    }
});

// Get discussions for an anime
app.get("/discussions/:anime_id", (req, res) => {
    db.all(
        "SELECT * FROM discussions WHERE anime_id = ?",
        [req.params.anime_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Post a discussion
app.post("/discussions", (req, res) => {
    const { anime_id, name, message } = req.body;
    if (!anime_id || !name || !message) return res.status(400).json({ error: "All fields are required" });

    db.run("INSERT INTO discussions (anime_id, name, message) VALUES (?, ?, ?)", [anime_id, name, message], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Serve homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  
