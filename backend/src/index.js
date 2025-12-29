require("dotenv").config();
const express = require("express");
const cors = require("cors");

const pool = require("./db");
const { encrypt, decrypt } = require("./utils/crypto");
const { hashPassword } = require("./utils/hash");

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== HEALTH CHECK ===== */
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "CodeVault backend running ✅",
      dbTime: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed ❌" });
  }
});

/* ===== SINGLE NOTE API =====
   FLOW:
   - password only
   - if exists → open
   - if not exists → empty editor
   - if content provided → save
*/
app.post("/api/note", async (req, res) => {
  try {
    const { password, content } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const passwordHash = hashPassword(password);

    const existing = await pool.query(
      "SELECT * FROM notes WHERE password_hash = $1",
      [passwordHash]
    );

    /* ===============================
       NOTE EXISTS
    =============================== */
    if (existing.rowCount > 0) {
      const note = existing.rows[0];

      const decryptedPassword = decrypt(note.password_encrypted);

      if (decryptedPassword !== password) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // 🔥 UPDATE IF CONTENT IS SENT
      if (typeof content === "string") {
        await pool.query(
          `
          UPDATE notes
          SET content = $1,
              updated_at = NOW()
          WHERE password_hash = $2
          `,
          [content, passwordHash]
        );

        return res.json({ updated: true });
      }

      // 🔓 OPEN ONLY
      return res.json({
        exists: true,
        content: note.content,
      });
    }

    /* ===============================
       NOTE DOES NOT EXIST → CREATE
    =============================== */
    if (typeof content !== "string") {
      return res.json({
        exists: false,
        content: "",
      });
    }

    const encryptedPassword = encrypt(password);

    await pool.query(
      `
      INSERT INTO notes (password_hash, password_encrypted, content)
      VALUES ($1, $2, $3)
      `,
      [passwordHash, encryptedPassword, content]
    );

    return res.json({ created: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ===== SERVER START ===== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
