//Load all groceries currently in the user's JSON
function renderGrocery() {
  fetch("/get-inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
    .then((res) => res.json())
    .then((data) => {
      groceryItems = data.grocery || [];

      const list = document.getElementById("grocery-list");
      list.innerHTML = "";
      groceryItems.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between py-2 px-4";
        li.innerHTML = `
          <span>${item.name} (${item.quantity})</span>
          <span>
            <button class="mr-2 bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded bought-btn" data-index="${index}">Bought</button>
            <button class="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded remove-btn" data-index="${index}">Remove</button>
          </span>
        `;
        list.appendChild(li);
      });

      document.querySelectorAll(".bought-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const index = parseInt(btn.getAttribute("data-index"));
          markItemBought(index);
        });
      });

      document.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const index = parseInt(btn.getAttribute("data-index"));
          removeGroceryItem(index);
        });
      });
    })
    .catch((err) => {
      console.error("Error loading grocery list:", err);
    });
}

//Format input for the JSON
function addGroceryItem(name, quantity) {
  const newItem = { name, quantity };
  updateInventory("grocery", newItem);
}

//Delete groceries from the JSON
function removeGroceryItem(index) {
  fetch("/remove-item", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      listType: "grocery",
      index: index,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      renderGrocery();
      renderDashboard();
    })
    .catch((err) => {
      console.error("Error removing grocery item:", err);
    });
}

//Move grocery item to the pantry
function markItemBought(index) {
  const item = groceryItems[index];
  if (!item) return;

  const pantryItem = {
    name: item.name,
    quantity: item.quantity,
    category: "Other",
  };

  fetch("/update-inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      listType: "pantry",
      item: pantryItem,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      removeGroceryItem(index);
    })
    .catch((err) => {
      console.error("Error moving item to pantry:", err);
    });
}

//Event listenter to call addGrocery on button click 
document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("grocery-add-button");

  if (addButton) {
    addButton.addEventListener("click", () => {
      const name = document.getElementById("grocery-item-name").value.trim();
      const qty = document.getElementById("grocery-item-qty").value.trim();

      if (name && qty) {
        addGroceryItem(name, qty);
        document.getElementById("grocery-item-name").value = "";
        document.getElementById("grocery-item-qty").value = "";
      }
    });
  } else {
    console.error("grocery-add-button not found");
  }
});
