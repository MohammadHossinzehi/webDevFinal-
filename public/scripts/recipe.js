//Load all recipes currently in the user's JSON
function renderRecipes() {
  const container = document.getElementById("recipes-container");
  container.innerHTML = "";
  recipeSuggestions.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "mb-4 p-4 bg-white rounded shadow";
      let ingredientsList = "";
      recipe.ingredients.forEach((ing) => {
          const ingredientName = ing.name.toLowerCase();
          const ingredientQuantity = ing.quantity;
          const hasItem = pantryItems.find(
              (p) => p.name.toLowerCase() === ingredientName
          );
          if (hasItem) {
              ingredientsList += `<li class="mb-1">${ing.name} (${ingredientQuantity}) <span class="text-green-600 text-sm">(On hand)</span></li>`;
          } else {
              ingredientsList += `<li class="mb-1">${ing.name} (${ingredientQuantity}) <span class="text-red-600 text-sm">(Missing)</span></li>`;
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