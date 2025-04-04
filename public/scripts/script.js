// State variables
let pantryItems = [];
let groceryItems = [];
let recipeSuggestions = [];
let pantryLoaded = false;
let groceryLoaded = false;
let recipesLoaded = false;

// Fetch data from JSON file
function fetchData() {
  return fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      pantryItems = data.pantryItems || [];
      groceryItems = data.groceryItems || [];
      recipeSuggestions = data.recipes || [];

      pantryLoaded = true;
      groceryLoaded = true;
      recipesLoaded = true;

      console.log("Data loaded successfully");
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
}

// Function to send the data to the server
function updateInventory(listType, newItem) {
  fetch('/update-inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listType: listType,
      item: newItem,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Inventory updated:', data);
      // Optionally, refresh the UI to reflect changes
      if (listType === 'pantry') {
        renderPantry(data.updatedInventory.pantry);
      } else if (listType === 'grocery') {
        renderGrocery(data.updatedInventory.grocery);
      }
    })
    .catch((error) => {
      console.error('Error updating inventory:', error);
    });
}

// Function to render pantry items (you can expand this to populate the pantry table)
function renderPantry(pantry) {
  const pantryTableBody = document.getElementById('pantry-table-body');
  pantryTableBody.innerHTML = ''; // Clear current table content
  pantry.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.category}</td>
    `;
    pantryTableBody.appendChild(row);
  });
}

// Function to render grocery items (you can expand this to populate the grocery list)
function renderGrocery(grocery) {
  const groceryList = document.getElementById('grocery-list');
  groceryList.innerHTML = ''; // Clear current list content
  grocery.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} - ${item.quantity}`;
    groceryList.appendChild(listItem);
  });
}

// Render recipe suggestions
function renderRecipes() {
  const recipeList = document.getElementById("recipe-list");
  recipeList.innerHTML = "";
  recipeSuggestions.forEach((recipe) => {
    const li = document.createElement("li");
    li.textContent = `${recipe.title}: ${recipe.ingredients.join(", ")}`;
    recipeList.appendChild(li);
  });
}

// Render dashboard
function renderDashboard() {
  document.getElementById("pantry-count").textContent = pantryItems.length;
  document.getElementById("grocery-count").textContent = groceryItems.length;
  document.getElementById("recipe-count").textContent = recipeSuggestions.length;
}

// Show the selected section
function showSection(target) {
  document.querySelectorAll("#content section").forEach((sec) => {
    sec.classList.add("hidden");
  });
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.remove("bg-blue-700");
  });

  const sectionId = `${target}-section`;
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.classList.remove("hidden");

  const navLink = document.querySelector(`nav a[href="#${target}"]`);
  if (navLink) {
    navLink.classList.add("bg-blue-700");
  }

  if (!pantryLoaded || !groceryLoaded || !recipesLoaded) {
    fetchData().then(() => {
      if (target === "pantry") renderPantry();
      if (target === "grocery") renderGrocery();
      if (target === "recipes") renderRecipes();
      if (target === "dashboard") renderDashboard();
    });
  } else {
    if (target === "pantry") renderPantry();
    if (target === "grocery") renderGrocery();
    if (target === "recipes") renderRecipes();
    if (target === "dashboard") renderDashboard();
  }
}

// Helper: render functions for each section
function renderPantry() {
  const tbody = document.getElementById("pantry-table-body");
  tbody.innerHTML = ""; // clear any existing rows
  pantryItems.forEach((item, index) => {
    // Create table row
    const tr = document.createElement("tr");
    tr.className =
      "border-b border-gray-200 last:border-b-0 " +
      (index % 2 ? "bg-gray-50" : "bg-white");
    tr.innerHTML = `
            <td class="px-4 py-2 text-sm">${item.name}</td>
            <td class="px-4 py-2 text-sm">${item.quantity}</td>
            <td class="px-4 py-2 text-sm">${item.category}</td>
        `;
    tbody.appendChild(tr);
  });
}
function renderGrocery() {
  const list = document.getElementById("grocery-list");
  list.innerHTML = "";
  groceryItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between py-2 px-4";
    li.innerHTML = `
            <span>${item.name} (${item.quantity})</span>
            <span>
                <button class="mr-2 bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded bought-btn" data-name="${item.name}">Bought</button>
                <button class="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded remove-btn" data-name="${item.name}">Remove</button>
            </span>
        `;
    list.appendChild(li);
  });
  // Attach event handlers for newly added buttons
  document.querySelectorAll(".bought-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      markItemBought(name);
    });
  });
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      removeGroceryItem(name);
    });
  });
}
function renderRecipes() {
  const container = document.getElementById("recipes-container");
  container.innerHTML = "";
  recipeSuggestions.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "mb-4 p-4 bg-white rounded shadow";
    // Build ingredients list
    let ingredientsList = "";
    recipe.ingredients.forEach((ing) => {
      const hasItem = pantryItems.find(
        (p) => p.name.toLowerCase() === ing.toLowerCase()
      );
      if (hasItem) {
        ingredientsList += `<li class="mb-1">${ing} <span class="text-green-600 text-sm">(On hand)</span></li>`;
      } else {
        ingredientsList += `<li class="mb-1">${ing} <span class="text-red-600 text-sm">(Missing)</span></li>`;
      }
    });
    card.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${recipe.title}</h3>
            <ul class="list-disc list-inside mb-2">${ingredientsList}</ul>
            <a href="#" class="text-blue-600 text-sm underline">View Recipe</a>
        `;
    container.appendChild(card);
  });
}


function renderDashboard() {
  // Render stats cards
  const statsContainer = document.getElementById("dashboard-stats");
  statsContainer.innerHTML = "";

  // Pantry items count
  const pantryCard = document.createElement("div");
  pantryCard.className = "bg-white p-4 rounded-lg shadow text-center";
  pantryCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Pantry Items</div>
    <div class="text-2xl font-bold">${pantryItems.length}</div>
  `;
  statsContainer.appendChild(pantryCard);

  // Grocery items count
  const groceryCard = document.createElement("div");
  groceryCard.className = "bg-white p-4 rounded-lg shadow text-center";
  groceryCard.innerHTML = `
    <div class="text-sm text-gray-600 uppercase mb-1">Grocery Items</div>
    <div class="text-2xl font-bold">${groceryItems.length}</div>
  `;
  statsContainer.appendChild(groceryCard);

  // Recipe suggestions count
  const recipesCard = document.createElement("div");
  recipesCard.className = "bg-white p-4 rounded-lg shadow text-center";
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

// Functions to handle adding/removing items
function addPantryItem(name, quantity, category) {
  // In a real app, here we'd send a request to backend to add the item
  pantryItems.push({ name: name, quantity: quantity, category: category });
  renderPantry();
  // Also update dashboard stats if it's loaded
  if (
    document
      .getElementById("dashboard-section")
      .classList.contains("hidden") === false
  ) {
    renderDashboard();
  }
}
function addGroceryItem(name, quantity) {
  // In a real app, send to backend
  groceryItems.push({ name: name, quantity: quantity });
  renderGrocery();
  // Optionally update dashboard stats if visible
  if (
    document
      .getElementById("dashboard-section")
      .classList.contains("hidden") === false
  ) {
    renderDashboard();
  }
}
function removeGroceryItem(name) {
  // Remove item from grocery list
  groceryItems = groceryItems.filter((item) => item.name !== name);
  renderGrocery();
  if (
    document
      .getElementById("dashboard-section")
      .classList.contains("hidden") === false
  ) {
    renderDashboard();
  }
}
function markItemBought(name) {
  // This simulates marking an item as bought: remove from grocery list and add to pantry
  const item = groceryItems.find((it) => it.name === name);
  if (!item) return;
  removeGroceryItem(name);
  // Decide category for new pantry item
  let cat = item.category || "Other";
  // If quantity is numeric or pieces, we can just add similarly
  addPantryItem(item.name, item.quantity, cat);
  // In a real app, we would also update backend (remove from grocery, add to pantry)
}

function showSection(target) {
  // Hide all sections
  document.querySelectorAll("#content section").forEach((sec) => {
    sec.classList.add("hidden");
  });

  // Remove active state from all nav links
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.remove("bg-blue-700");
  });

  // Show target section
  const sectionId = `${target}-section`;
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.classList.remove("hidden");

  // Highlight the corresponding nav link
  const navLink = document.querySelector(`nav a[href="#${target}"]`);
  if (navLink) {
    navLink.classList.add("bg-blue-700");
  }

  // If target requires data, load it and render content
  if (target === "pantry") {
    if (!pantryLoaded) {
      // show loading message
      document.getElementById("pantry-table-body").innerHTML =
        '<tr><td class="px-4 py-2 text-sm text-gray-500" colspan="3">Loading pantry items...</td></tr>';
      fetchData().then(() => {
        renderPantry();
      });
    } else {
      renderPantry();
    }
  } else if (target === "grocery") {
    if (!groceryLoaded) {
      document.getElementById("grocery-list").innerHTML =
        '<li class="py-2 px-4 text-center text-gray-500">Loading grocery list...</li>';
      fetchData().then(() => {
        renderGrocery();
      });
    } else {
      renderGrocery();
    }
  } else if (target === "recipes") {
    // Ensure pantry loaded for accurate availability highlighting
    const tasks = [];
    if (!pantryLoaded) {
      tasks.push(fetchData());
    }
    if (!recipesLoaded) {
      document.getElementById("recipes-container").innerHTML =
        '<p class="text-gray-500">Loading recipe suggestions...</p>';
      tasks.push(fetchData());
    }
    Promise.all(tasks).then(() => {
      renderRecipes();
    });
  } else if (target === "dashboard") {
    // Dashboard needs pantry & grocery data
    const tasks = [];
    if (!pantryLoaded) {
      tasks.push(fetchData());
    }
    if (!groceryLoaded) {
      tasks.push(fetchData());
    }
    if (tasks.length > 0) {
      // If data needs to load, show loading state
      document.getElementById("dashboard-stats").innerHTML =
        '<p class="text-gray-500">Loading dashboard...</p>';
      Promise.all(tasks).then(() => {
        renderDashboard();
      });
    } else {
      // Data already loaded
      renderDashboard();
    }
  }
}

// Event listeners for forms
document
  .getElementById("pantry-add-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("pantry-item-name");
    const qtyInput = document.getElementById("pantry-item-qty");
    const catSelect = document.getElementById("pantry-item-category");
    const name = nameInput.value.trim();
    const quantity = qtyInput.value.trim();
    const category = catSelect.value || "Other";
    if (name && quantity) {
      addPantryItem(name, quantity, category);
    }
    // Reset form
    nameInput.value = "";
    qtyInput.value = "";
    catSelect.selectedIndex = 0;
  });
document
  .getElementById("grocery-add-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("grocery-item-name");
    const qtyInput = document.getElementById("grocery-item-qty");
    const name = nameInput.value.trim();
    const quantity = qtyInput.value.trim();
    if (name && quantity) {
      addGroceryItem(name, quantity);
    }
    // Reset form
    nameInput.value = "";
    qtyInput.value = "";
  });

// Initialize default view on page load
window.addEventListener("load", () => {
  // Show section based on URL hash, default to dashboard
  let initial = window.location.hash
    ? window.location.hash.substring(1)
    : "dashboard";
  if (!["dashboard", "pantry", "grocery", "recipes"].includes(initial)) {
    initial = "dashboard";
  }
  showSection(initial);
});
// Also handle hash change (if user uses browser back/forward)
window.addEventListener("hashchange", () => {
  const target = window.location.hash.substring(1);
  if (target) {
    showSection(target);
  }
});

// Wait until the DOM is fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Pantry form submission
  document.getElementById("pantry-add-button").addEventListener("click", (event) => {
    event.preventDefault();
  
    const itemName = document.getElementById("pantry-item-name").value;
    const itemQty = document.getElementById("pantry-item-qty").value;
    const itemCategory = document.getElementById("pantry-item-category").value;
    console.log("Adding item:", itemName, itemQty, itemCategory); // Log values to debug

    const newItem = {
      name: itemName,
      quantity: itemQty,
      category: itemCategory,
    };
  
    fetch("/update-inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listType: "pantryItems",  // Use "grocery" if adding to grocery list
        item: newItem,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Item added successfully:", data);
        // Optionally, update the UI with the new item
      })
      .catch((error) => {
        console.error("Error updating inventory:", error);
      });
  });

  // Grocery form submission
  document.getElementById('grocery-add-button').addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    // Get the form data
    const name = document.getElementById('grocery-item-name').value;
    const qty = document.getElementById('grocery-item-qty').value;

    // Create a new grocery item object
    const newItem = {
      name: name,
      quantity: qty,
    };

    // Send the data to the backend to update the grocery list
    updateInventory('grocery', newItem);
  });
});
