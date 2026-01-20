let db;
let selectedButton = null;
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

  const tree = buildTagTree();
  const container = document.getElementById("tags");
  container.innerHTML = "";
  renderTagTree(container, tree);

  //loadTags();
}

// =======================
// Charger les tags
// =======================
function loadTags() {
  const result = db.exec("SELECT category, name, description FROM categories;");
  const rows = result[0].values;

  const container = document.getElementById("tags");
  container.innerHTML = "";

  rows.forEach(([category, name, description]) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.title = description;
    btn.onclick = () => {
      if (selectedButton) {
        selectedButton.classList.remove("selected");
      }
      btn.classList.add("selected");
      selectedButton = btn;
      loadEntriesByTag(category)
    };
    container.appendChild(btn);
  });
}

// =======================
// Requête récursive
// =======================
function loadEntriesByTag(category) {
  const query = `
    WITH RECURSIVE sub_categories AS (
      SELECT child_category FROM category_relations WHERE parent_category =?
    )
    SELECT DISTINCT article_day, question_number
    FROM relations_articles
    WHERE (category_id IN (SELECT * FROM sub_categories)) OR category_id=?;
  `;
  //const query = `
  //  SELECT DISTINCT article_day, question_number
  //  FROM relations_articles
  //  WHERE category_id=?;
  //`;

  const result = db.exec(query, [category,category]);

  const list = document.getElementById("entries");
  list.innerHTML = "";

  if (!result.length) return;

  result[0].values.forEach(([article_day, question_number]) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = 'Day '+ article_day.toString() + ' Q' + question_number.toString();

    link.href = `https://monsite.com/entry/${article_day}`;

    li.appendChild(link);
    list.appendChild(li);
  });
}

function buildTagTree() {
  const nodes = {};

  // Tous les tags
  const allTags = db.exec("SELECT category, name, description FROM categories;")[0].values;
  allTags.forEach(([category, name, description]) => {
    nodes[category] = { category, name, description, children: [] };
  });

  // Relations
  const relations = db.exec(`
    SELECT parent_category, child_category FROM category_relations;
  `)[0]?.values || [];

  relations.forEach(([parentId, childId]) => {
    nodes[parentId].children.push(nodes[childId]);
  });

  // Racines
  const roots = Object.values(nodes).filter(node => {
    return !relations.some(r => r[1] === node.category);
  });

  return roots;
}

let selectedTagElement = null;

function renderTagTree(container, nodes) {
  const ul = document.createElement("ul");
  ul.className = "tag-tree";

  nodes.forEach(node => {
    const li = document.createElement("li");
    li.className = "tag-node";

    // ▶ toggle
    const toggle = document.createElement("span");
    toggle.className = "toggle";
    toggle.textContent = node.children.length ? "▶" : "";
    toggle.onclick = (e) => {
      e.stopPropagation();
      if (!childrenUl) return;

      const isCollapsed = childrenUl.classList.toggle("collapsed");
      toggle.textContent = isCollapsed ? "▶" : "▼";
    };

    // tag clickable
    const tagSpan = document.createElement("span");
    tagSpan.className = "tag";
    tagSpan.textContent = node.name;

    tagSpan.onclick = () => {
      if (selectedTagElement) {
        selectedTagElement.classList.remove("selected");
      }
      tagSpan.classList.add("selected");
      selectedTagElement = tagSpan;

      loadEntriesByTag(node.category);
    };

    li.appendChild(toggle);
    li.appendChild(tagSpan);

    let childrenUl = null;
    if (node.children.length) {
      childrenUl = document.createElement("ul");
      childrenUl.className = "tag-tree collapsed";

      renderTagTree(childrenUl, node.children);
      li.appendChild(childrenUl);
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
}



initDB();

