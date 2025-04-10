//Load all dashboard items currently in the user's JSON (using the other page items)
function renderDashboard() {
  const statsContainer = document.getElementById("dashboard-stats");
  statsContainer.innerHTML = "";

  const pantryCard = document.createElement("div");
  pantryCard.className = "bg-white p-4 rounded-lg shadow-lg text-center";
  pantryCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Pantry Items</div>
    <div class="text-2xl font-bold">${pantryItems.length}</div>
  `;
  statsContainer.appendChild(pantryCard);

  const groceryCard = document.createElement("div");
  groceryCard.className = "bg-white p-4 rounded-lg shadow-lg text-center";
  groceryCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Grocery Items</div>
    <div class="text-2xl font-bold">${groceryItems.length}</div>
  `;
  statsContainer.appendChild(groceryCard);

  const recipesCard = document.createElement("div");
  recipesCard.className = "bg-white p-4 rounded-lg shadow-lg text-center";
  recipesCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Recipes</div>
    <div class="text-2xl font-bold">${recipeSuggestions.length}</div>
  `;
  statsContainer.appendChild(recipesCard);

  const noticeDiv = document.getElementById("low-stock-notice");
  noticeDiv.innerHTML = "";

  const lowStockItems = pantryItems.filter((item) => {
    let qtyStr = item.quantity.trim();
    let qtyNum = parseInt(qtyStr.split(" ")[0]);
    if (isNaN(qtyNum)) return false;
    return qtyNum <= 2;
  });

  if (lowStockItems.length > 0) {
    const list = lowStockItems.map((item) => `${item.name} (${item.quantity})`).join(", ");
    noticeDiv.innerHTML += `
      <div class="mt-4 p-3 rounded bg-yellow-100 text-yellow-800 text-sm">
        ⚠️ <strong>Low Stock:</strong> ${list}
      </div>
    `;
  }

  const today = new Date();
  const soonExpiringItems = pantryItems.filter(item => {
    if (!item.expiry) return false;
    const expiryDate = new Date(item.expiry);
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = timeDiff / (1000 * 60 * 60 * 24);
    return daysLeft <= 2 && daysLeft >= 0;
  });

  if (soonExpiringItems.length > 0) {
    const expiringList = soonExpiringItems.map(item => {
      const expiryDate = new Date(item.expiry);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      let label = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays} days`;
      return `${item.name} (expires ${label})`;
    }).join(", ");

    noticeDiv.innerHTML += `
      <div class="mt-4 p-3 rounded bg-red-100 text-red-800 text-sm">
        ⏰ <strong>Expiring Soon:</strong> ${expiringList}
      </div>
    `;
  }

  const expiredItems = pantryItems.filter(item => {
    if (!item.expiry) return false;
    const expiryDate = new Date(item.expiry);
    return expiryDate < today;
  });

  if (expiredItems.length > 0) {
    const expiredList = expiredItems.map(item => {
      const expiredOn = new Date(item.expiry).toLocaleDateString();
      return `${item.name} (expired on ${expiredOn})`;
    }).join(", ");

    noticeDiv.innerHTML += `
      <div class="mt-4 p-3 rounded bg-gray-200 text-red-900 text-sm font-semibold border border-red-300">
        🚫 <strong>Expired:</strong> ${expiredList} — <span class="font-bold">Do not eat!</span>
      </div>
    `;
  }
}

//Get data and create available recipes chart
async function canMake() {
  let recipes = [];
  let pantryItems = [];

  //Get data
  try {
    const response = await fetch("/get-inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    recipes = data.recipe;
    pantryItems = data.pantry;
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return;
  }
 
  //Compile data
  let canMake = 0;
  recipes.forEach((recipe) => {
    let canMakeRecipe = true;
    recipe.ingredients.forEach((ingredient) => {
      const foundInPantry = pantryItems.some((item) => item.name.toLowerCase() === ingredient.name.toLowerCase());
      if (!foundInPantry) {
        canMakeRecipe = false;
      }
    });
    if (canMakeRecipe) canMake++;
  });
  
  //Making D3 chart with SVG
  const cantMake = recipes.length - canMake;

  const chartData = [
    { label: "Makeable", value: canMake },
    { label: "Not Makeable", value: cantMake },
  ];

  const width = 300;
  const height = 300;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select("#pieChart");
  svg.selectAll("*").remove();

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(chartData.map((d) => d.label))
    .range(["#10b981", "#ef4444"]); 

  const pie = d3.pie().value((d) => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  const arcs = g.selectAll("arc")
    .data(pie(chartData))
    .enter()
    .append("g");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label));

  arcs.append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .attr("font-size", "16px")
    .text((d) => `${d.data.label}: ${d.data.value}`);
}

//Event listener on page load
document.addEventListener('DOMContentLoaded', canMake);