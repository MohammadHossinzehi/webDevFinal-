function renderPantry() {
  const tbody = document.getElementById("pantry-table-body");
  tbody.innerHTML = ""; // clear any existing rows

  pantryItems.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className =
      "border-b border-gray-200 last:border-b-0 " +
      (index % 2 ? "bg-gray-50" : "bg-white");

    tr.innerHTML = `
      <td class="px-4 py-2 text-sm">${item.name}</td>
      <td class="px-4 py-2 text-sm">${item.quantity}</td>
      <td class="px-4 py-2 text-sm">${item.category}</td>
      <td class="px-4 py-2 text-sm text-right">
        <button class="text-blue-600 hover:underline text-sm edit-btn" data-index="${index}">Edit</button>
        <button class="text-red-600 hover:underline text-sm ml-2 remove-btn" data-index="${index}">Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach edit button listeners
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      showEditForm(index);
    });
  });

  // Attach remove button listeners
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      const item = pantryItems[index];

      if (confirm(`Are you sure you want to remove "${item.name}"?`)) {
        fetch("/remove-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listType: "pantry",
            itemName: item.name,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            pantryItems = data.updatedInventory.pantry;
            renderPantry();
            renderDashboard();
          })
          .catch((err) => {
            console.error("Error removing item:", err);
          });
      }
    });
  });
}

function showEditForm(index) {
  const item = pantryItems[index];
  const tbody = document.getElementById("pantry-table-body");
  const row = tbody.children[index];

  row.innerHTML = `
    <td><input type="text" class="form-input text-sm" value="${item.name}" id="edit-name-${index}"></td>
    <td><input type="text" class="form-input text-sm" value="${item.quantity}" id="edit-qty-${index}"></td>
    <td>
      <select class="form-input text-sm" id="edit-cat-${index}">
        ${["Dairy", "Produce", "Baking", "Meat", "Grains", "Spices", "Condiments", "Other"]
          .map(cat => `<option value="${cat}" ${cat === item.category ? "selected" : ""}>${cat}</option>`)
          .join("")}
      </select>
    </td>
    <td class="text-right">
      <button class="bg-green-600 text-white text-sm px-3 py-1 rounded mr-2 save-edit-btn" data-index="${index}">Save</button>
      <button class="bg-gray-400 text-white text-sm px-3 py-1 rounded cancel-edit-btn" data-index="${index}">Cancel</button>
    </td>
  `;

  row.querySelector(".save-edit-btn").addEventListener("click", () => {
    const updatedItem = {
      name: document.getElementById(`edit-name-${index}`).value.trim(),
      quantity: document.getElementById(`edit-qty-${index}`).value.trim(),
      category: document.getElementById(`edit-cat-${index}`).value,
    };
    pantryItems[index] = updatedItem;
    updateInventory("pantry", updatedItem);
    renderPantry();
  });

  row.querySelector(".cancel-edit-btn").addEventListener("click", () => {
    renderPantry(); 
  });
}

// Functions to handle adding pantry items
function addPantryItem(name, quantity, category) {
  const newItem = { name, quantity, category };
  updateInventory("pantry", newItem);
}
