let pantryItems = [];
let groceryItems = [];
let recipeSuggestions = [];
let pantryLoaded = false;
let groceryLoaded = false;
let recipesLoaded = false;

// Fetch data from JSON file
function fetchData() {
  const username = localStorage.getItem("username");
  return fetch(`userData/${username}.json`)
    .then((response) => response.json())
    .then((data) => {
      pantryItems = data.pantryItems || [];
      groceryItems = data.groceryItems || [];
      recipeSuggestions = data.recipes || [];
      pantryLoaded = true;
      groceryLoaded = true;
      recipesLoaded = true;
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
}

// Function to send the data to the server
function updateInventory(listType, newItem) {
  const username = localStorage.getItem("username");
  if (!username) return;

  fetch("/update-inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      listType,
      item: newItem,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Inventory updated:", data);
      fetchData().then(() => {
        if (listType === "pantry") renderPantry();
        else if (listType === "grocery") renderGrocery();
        renderDashboard();
      });
    })
    .catch((error) => {
      console.error("Error updating inventory:", error);
    });
}

function updateRecipe(listType, newRecipe) {
  const username = localStorage.getItem("username");
  if (!username) return;

  fetch("/update-inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      listType,
      item: newRecipe,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Inventory updated:", data);

      if (listType === "recipes") {
        recipeSuggestions.push(newRecipe);
        renderRecipes();                  
      }

      renderDashboard();
    })
    .catch((error) => {
      console.error("Error updating recipe:", error);
    });
}

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
  document
    .getElementById("pantry-add-button")
    .addEventListener("click", (event) => {
      event.preventDefault();

      const itemName = document.getElementById("pantry-item-name").value.trim();
      const itemQty = document.getElementById("pantry-item-qty").value.trim();
      const itemCategory = document.getElementById("pantry-item-category").value;
      const itemExpiry = document.getElementById("pantry-item-expiry").value;

      if (!itemName || !itemQty || !itemCategory) return;

      const newItem = {
        name: itemName,
        quantity: itemQty,
        category: itemCategory,
        expiry: itemExpiry,
      };

      updateInventory("pantry", newItem);
    });

  //Grocery form submission
  document.getElementById("grocery-add-button").addEventListener("click", (event) => {
      event.preventDefault();

      const name = document.getElementById("grocery-item-name").value.trim();
      const qty = document.getElementById("grocery-item-qty").value.trim();

      if (!name || !qty) return;

      const newItem = {
        name: name,
        quantity: qty,
      };

      updateInventory("grocery", newItem);
    });

  document.getElementById("recipe-add-button").addEventListener("click", (event) => {
      event.preventDefault();

      const title = document.getElementById("recipe-title").value.trim();
      const ingredients = document.getElementById("recipe-ingredients").value.trim();

      if (!title || !ingredients) return;

      const ingredientPairs = ingredients.split(",").map((entry) => entry.trim());
      const ingredientsArray = ingredientPairs.map((pair) => {
        const [name, quantity] = pair.split(":").map((s) => s.trim());
        return { name, quantity };
      });

      const newRecipe = {
        title,
        ingredients: ingredientsArray,
      };
      
      updateRecipe("recipes", newRecipe);
    });
});