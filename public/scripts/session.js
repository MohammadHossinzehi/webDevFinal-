if (
  !localStorage.getItem("isLoggedIn") &&
  !window.location.pathname.includes("login.html")
) {
  window.location.href = "/login.html";
}

if (username) {
  const welcomeElement = document.getElementById("welcome-message");
  if (welcomeElement) {
    welcomeElement.textContent = `Hello, ${username}!`;
  }

  createUserDataFile(username);
}

function createUserDataFile(username) {
  const defaultData = {
    pantryItems: [],
    groceryItems: [],
    recipes: [
      {
        title: "Pancakes",
        ingredients: ["Flour", "Eggs", "Milk", "Sugar", "Butter"],
      },
      {
        title: "Spaghetti Bolognese",
        ingredients: [
          "Spaghetti Pasta",
          "Ground Beef",
          "Tomato Sauce",
          "Onion",
          "Olive Oil",
          "Salt",
        ],
      },
      {
        title: "Chicken Stir Fry",
        ingredients: [
          "Chicken Breast",
          "Broccoli",
          "Bell Pepper",
          "Soy Sauce",
          "Salt",
        ],
      },
    ],
  };

  fetch("/api/create-user-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, data: defaultData }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to create user file");
      return res.json();
    })
    .catch((err) => console.error("Create file error:", err));
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}
