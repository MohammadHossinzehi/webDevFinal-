// Render dashboard
function renderDashboard() {
  // Render stats cards
  const statsContainer = document.getElementById("dashboard-stats");
  statsContainer.innerHTML = "";

  // Pantry items count
  const pantryCard = document.createElement("div");
  pantryCard.className = "bg-white p-4 rounded-lg shadow-lg text-center";
  pantryCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Pantry Items</div>
    <div class="text-2xl font-bold">${pantryItems.length}</div>
  `;
  statsContainer.appendChild(pantryCard);

  // Grocery items count
  const groceryCard = document.createElement("div");
  groceryCard.className = "bg-white p-4 rounded-lg shadow-lg text-center";
  groceryCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Grocery Items</div>
    <div class="text-2xl font-bold">${groceryItems.length}</div>
  `;
  statsContainer.appendChild(groceryCard);

  // Recipe suggestions count
  const recipesCard = document.createElement("div");
  recipesCard.className = "bg-white p-4 rounded-lg shadow-lg text-center";
  recipesCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Recipes</div>
    <div class="text-2xl font-bold">${recipeSuggestions.length}</div>
  `;
  statsContainer.appendChild(recipesCard);

  // Low stock notice
  const noticeDiv = document.getElementById("low-stock-notice");
  noticeDiv.innerHTML = "";

  const lowItems = pantryItems.filter((item) => {
    let qtyStr = item.quantity.trim();
    let parts = qtyStr.split(" ");
    let qtyNum = parseInt(parts[0]);
    if (isNaN(qtyNum)) return false;

    if (parts.length > 1) {
      let unit = parts.slice(1).join(" ").toLowerCase();
      const countUnits = ["piece", "pieces", "pcs", "egg", "eggs", "unit", "units"];
      const measureUnits = ["l", "kg", "g", "pack", "bottle", "jar", "head", "loaf"];
      if (measureUnits.includes(unit)) {
        return false;
      }
      if (countUnits.includes(unit)) {
        return qtyNum <= 2;
      }
    } else {
      return qtyNum <= 2;
    }
    return false;
  });

  if (lowItems.length > 0) {
    const lowList = lowItems
      .map((it) => `${it.name} (${it.quantity} left)`)
      .join(", ");
    noticeDiv.innerHTML = `<div class="mt-4 p-3 rounded bg-yellow-100 text-yellow-800 text-sm">⚠️ Low stock: ${lowList}</div>`;
  }
}