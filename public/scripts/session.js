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
        "title": "Pancakes",
        "ingredients": [
          {
            "name": "Flour",
            "quantity": "1 cup"
          },
          {
            "name": "Water",
            "quantity": "2 cups"
          }
        ]
      },
      {
        "title": "Carbonara",
        "ingredients": [
          {
            "name": "Spaghetti",
            "quantity": "400g"
          },
          {
            "name": "Olive oil",
            "quantity": "1tbsp"
          },
          {
            "name": "Smoked Pancetta",
            "quantity": "200g"
          },
          {
            "name": "Garlic cloves",
            "quantity": "2"
          },
          {
            "name": "Eggs",
            "quantity": "3"
          },
          {
            "name": "Cream",
            "quantity": "75ml"
          },
          {
            "name": "Parmesan",
            "quantity": "50g"
          }
        ]
      },
      {
        "title": "Pepperoni Pizza",
        "ingredients": [
          {
            "name": "Pizza Dough",
            "quantity": "500g"
          },
          {
            "name": "Tomato Sauce",
            "quantity": "200g"
          },
          {
            "name": "Mozzarella Cheese",
            "quantity": "300g"
          },
          {
            "name": "Pepperoni",
            "quantity": "100g"
          }
        ]
      }
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
