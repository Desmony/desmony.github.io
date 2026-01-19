let db;

// =======================
// Initialisation SQLite
// =======================
async function initDB() {
  const SQL = await initSqlJs({
    locateFile: file => `wasm/${file}`
  });

  const response = await fetch("cfdb.db");
  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  loadTags();
}

// =======================
// Charger les tags
// =======================
function loadTags() {
  const result = db.exec("SELECT category, name FROM categories;");
  const rows = result[0].values;

  const container = document.getElementById("tags");
  container.innerHTML = "";

  rows.forEach(([category, name]) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => loadEntriesByTag(category);
    container.appendChild(btn);
  });
}

// =======================
// Requête récursive
// =======================
function loadEntriesByTag(category) {
  const query = `
    SELECT * FROM relations_articles WHERE category_id=?;
  `;

  const result = db.exec(query, [category]);

  const list = document.getElementById("entries");
  list.innerHTML = "";

  if (!result.length) return;

  result[0].values.forEach(([article_day, question_number]) => {
    const li = document.createElement("li");
    li.textContent = str(article_day)+'.'+str(question_number);
    list.appendChild(li);
  });
}

initDB();

