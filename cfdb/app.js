let db;

// =======================
// Initialisation SQLite
// =======================
async function initDB() {
  const SQL = await initSqlJs({
    locateFile: file => `wasm/${file}`
  });

  const response = await fetch("database.db");
  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  loadTags();
}

// =======================
// Charger les tags
// =======================
function loadTags() {
  const result = db.exec("SELECT id, name, slug FROM tag;");
  const rows = result[0].values;

  const container = document.getElementById("tags");
  container.innerHTML = "";

  rows.forEach(([id, name, slug]) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => loadEntriesByTag(slug);
    container.appendChild(btn);
  });
}

// =======================
// Requête récursive
// =======================
function loadEntriesByTag(slug) {
  const query = `
    WITH RECURSIVE sub_tags AS (
      SELECT id FROM tag WHERE slug = ?
      UNION ALL
      SELECT tr.child_tag_id
      FROM tag_relation tr
      JOIN sub_tags st ON tr.parent_tag_id = st.id
    )
    SELECT DISTINCT e.title
    FROM entry e
    JOIN entry_tag et ON e.id = et.entry_id
    WHERE et.tag_id IN (SELECT id FROM sub_tags);
  `;

  const result = db.exec(query, [slug]);

  const list = document.getElementById("entries");
  list.innerHTML = "";

  if (!result.length) return;

  result[0].values.forEach(([title]) => {
    const li = document.createElement("li");
    li.textContent = title;
    list.appendChild(li);
  });
}

initDB();

