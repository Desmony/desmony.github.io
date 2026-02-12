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
  renderTagColumns(tree);

  //loadTags();
}

// =======================
// Charger les tags
// =======================
function loadTags() {
	const query = `WITH RECURSIVE sub_categories AS (
    	SELECT
       		c.category AS root_category,
        	c.category AS child_category
    	FROM categories c
    	UNION ALL
    	SELECT
    	    sc.root_category,
    	    cr.child_category
    	FROM category_relations cr
    	JOIN sub_categories sc
    	    ON cr.parent_category = sc.child_category
		)
		SELECT
		    c.category,
		    c.name,
		    c.description,
		    COUNT(*) AS total_entries
		FROM (
		    SELECT DISTINCT
		           sc.root_category,
		           ra.article_day,
		           ar.answer
		    FROM sub_categories sc
		    JOIN relations_articles ra
		        ON ra.category_id = sc.child_category
		    JOIN articles ar
		        ON ar.day = ra.article_day
		       AND ar.question = ra.question_number
		) t
		JOIN categories c
		    ON c.category = t.root_category
		GROUP BY
		    c.category,
		    c.name,
		    c.description
		;`
  const result = db.exec(query);
  const rows = result[0].values;

  const container = document.getElementById("tags");
  container.innerHTML = "";

  rows.forEach(([category, name, description, total_entries]) => {
    const btn = document.createElement("button");
    const text_category = name.toString() + ' (' + total_entries.toString() + ')';
    btn.textContent = text_category;
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
		UNION ALL
		SELECT cr.child_category FROM category_relations cr
		JOIN sub_categories sc ON cr.parent_category = sc.child_category
	)
	SELECT DISTINCT article_day, question_number FROM relations_articles WHERE (category_id IN (SELECT * FROM sub_categories)) OR category_id=?;
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
    li.className = "a";
    link.textContent = 'Day '+ article_day.toString() + ' Q' + question_number.toString();

    link.href = `https://catfishing.net/game/${article_day}`;

    li.appendChild(link);
    list.appendChild(li);
  });
}

function buildTagTree() {
  const nodes = {};

  const query = `WITH RECURSIVE sub_categories AS (
    	SELECT
       		c.category AS root_category,
        	c.category AS child_category
    	FROM categories c
    	UNION ALL
    	SELECT
    	    sc.root_category,
    	    cr.child_category
    	FROM category_relations cr
    	JOIN sub_categories sc
    	    ON cr.parent_category = sc.child_category
		)
		SELECT
		    c.category,
		    c.name,
		    c.description,
		    COUNT(*) AS total_entries
		FROM (
		    SELECT DISTINCT
		           sc.root_category,
		           ra.article_day,
		           ar.answer
		    FROM sub_categories sc
		    JOIN relations_articles ra
		        ON ra.category_id = sc.child_category
		    JOIN articles ar
		        ON ar.day = ra.article_day
		       AND ar.question = ra.question_number
		) t
		JOIN categories c
		    ON c.category = t.root_category
		GROUP BY
		    c.category,
		    c.name,
		    c.description
    ORDER BY
        c.name
		;`

  // Tous les tags
  const allTags = db.exec(query)[0].values;
  allTags.forEach(([category, name, description, count]) => {
    nodes[category] = { category, name, description, count, children: [] };
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
  nodes.forEach(node => {
    const li = document.createElement("li");
    li.className = "tag-node";

    // ▶ toggle
    const toggle = document.createElement("span");
    toggle.className = "toggle";
    toggle.textContent = node.children.length ? "▶" : "";

    // children UL (déclaré avant pour le toggle)
    let childrenUl = null;

    toggle.onclick = (e) => {
      e.stopPropagation();
      if (!childrenUl) return;

      const isCollapsed = childrenUl.classList.toggle("collapsed");
      toggle.textContent = isCollapsed ? "▶" : "▼";
    };

    // tag clickable
    const tagSpan = document.createElement("span");
    tagSpan.className = "tag";
    tagSpan.textContent = node.name + ' (' + node.count + ')';
    tagSpan.title = node.description;

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

    if (node.children.length) {
      childrenUl = document.createElement("ul");
      childrenUl.className = "tag-tree collapsed";

      renderTagTree(childrenUl, node.children);
      li.appendChild(childrenUl);
    }

    container.appendChild(li);
  });
}

function renderTagColumns(tree) {
  const container = document.getElementById("tags");
  container.innerHTML = "";

  tree.forEach(root => {
    const column = document.createElement("div");
    column.className = "tag-column";

    const ul = document.createElement("ul");
    ul.className = "tag-tree";

    renderTagTree(ul, [root]);

    column.appendChild(ul);
    container.appendChild(column);
  });
}




initDB();

