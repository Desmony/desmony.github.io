import express from "express";
import Database from "better-sqlite3";

const app = express();
const db = new Database("cfdb.db");

// =======================
// Utilitaire : sous-tags
// =======================
function getSubTagIdsBySlug(slug) {
  const stmt = db.prepare(`
    WITH RECURSIVE sub_tags AS (
      SELECT id
      FROM tag
      WHERE slug = ?

      UNION ALL

      SELECT tr.child_tag_id
      FROM tag_relation tr
      JOIN sub_tags st ON tr.parent_tag_id = st.id
    )
    SELECT id FROM sub_tags;
  `);

  return stmt.all(slug).map(row => row.id);
}

// =======================
// Route API principale
// =======================
app.get("/entries", (req, res) => {
  const { tag } = req.query;

  if (!tag) {
    return res.status(400).json({ error: "tag manquant" });
  }

  const tagIds = getSubTagIdsBySlug(tag);

  if (tagIds.length === 0) {
    return res.json([]);
  }

  const placeholders = tagIds.map(() => "?").join(",");

  const entries = db.prepare(`
    SELECT DISTINCT e.id, e.title
    FROM entry e
    JOIN entry_tag et ON e.id = et.entry_id
    WHERE et.tag_id IN (${placeholders})
  `).all(...tagIds);

  res.json(entries);
});

// =======================
// Démarrage serveur
// =======================
app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
