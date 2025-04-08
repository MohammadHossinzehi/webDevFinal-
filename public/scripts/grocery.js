// Function to render grocery items
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

function removeGroceryItem(name) {
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
  const item = groceryItems.find((it) => it.name === name);
  if (!item) return;
  removeGroceryItem(name);
  let cat = item.category || "Other";
  addPantryItem(item.name, item.quantity, cat);
}