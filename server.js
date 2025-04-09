const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// Helper: Determine Content Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
  };
  return map[ext] || "application/octet-stream";
}

const server = http.createServer((req, res) => {
  const requestPath = req.url.split("?")[0];

  // /api/create-user-file
  if (req.method === "POST" && requestPath === "/api/create-user-file") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, data } = JSON.parse(body);
        if (!username || !data) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Invalid data" }));
        }

        const filePath = path.join(publicDir, "userData", `${username}.json`);
        if (fs.existsSync(filePath)) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "File already exists" }));
        }

        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Failed to create file" })
            );
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: `File created for ${username}` }));
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
    return;
  }

  // /api/login
  if (req.method === "POST" && requestPath === "/api/login") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, password } = JSON.parse(body);
        const loginFile = path.join(__dirname, "login.json");

        fs.readFile(loginFile, "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Error reading login file");
          }

          const users = JSON.parse(data);
          if (users[username] && users[username] === password) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Login successful" }));
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid credentials" }));
          }
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid request format" }));
      }
    });
    return;
  }

  // /api/signup
  if (req.method === "POST" && requestPath === "/api/signup") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, password } = JSON.parse(body);
        const loginFile = path.join(__dirname, "login.json");

        fs.readFile(loginFile, "utf8", (err, data) => {
          if (err && err.code !== "ENOENT") {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Error reading login file" })
            );
          }

          const users = data ? JSON.parse(data) : {};
          if (users[username]) {
            res.writeHead(409, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Username already exists" })
            );
          }

          users[username] = password;
          fs.writeFile(loginFile, JSON.stringify(users, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({ message: "Error writing to login file" })
              );
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: "Account created successfully" })
            );
          });
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid request format" }));
      }
    });
    return;
  }
  // /get-inventory
  // /get-inventory
  if (req.method === "POST" && requestPath === "/get-inventory") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username } = JSON.parse(body);
        if (!username) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Username is required" }));
        }

        const userFilePath = path.join(
          publicDir,
          "userData",
          `${username}.json`
        );

        fs.readFile(userFilePath, "utf8", (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "User data not found" }));
          }

          try {
            const userData = JSON.parse(data);
            const pantry = userData.pantryItems || [];
            const grocery = userData.groceryItems || [];

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ pantry, grocery }));
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON in user file" }));
          }
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid request format" }));
      }
    });
    return;
  }

  // /remove-item
  if (req.method === "POST" && requestPath === "/remove-item") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, listType, index } = JSON.parse(body);
        if (
          typeof username !== "string" ||
          typeof listType !== "string" ||
          typeof index !== "number"
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Invalid request format" }));
        }

        const userFilePath = path.join(
          publicDir,
          "userData",
          `${username}.json`
        );

        fs.readFile(userFilePath, "utf8", (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "User data not found" }));
          }

          let userData;
          try {
            userData = JSON.parse(data);
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Invalid user data format" })
            );
          }

          if (listType === "pantry" && Array.isArray(userData.pantryItems)) {
            userData.pantryItems.splice(index, 1);
          } else if (
            listType === "grocery" &&
            Array.isArray(userData.groceryItems)
          ) {
            userData.groceryItems.splice(index, 1);
          } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Invalid list type or list missing" })
            );
          }

          fs.writeFile(
            userFilePath,
            JSON.stringify(userData, null, 2),
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(
                  JSON.stringify({ message: "Failed to update user data" })
                );
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  message: "Item removed successfully",
                  updatedInventory: {
                    pantry: userData.pantryItems,
                    grocery: userData.groceryItems,
                  },
                })
              );
            }
          );
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
    return;
  }

  // /update-inventory
  if (req.method === "POST" && requestPath === "/update-inventory") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, listType, item } = JSON.parse(body);
        if (!username || !listType || !item) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ message: "Missing data in request" })
          );
        }

        const userFilePath = path.join(
          publicDir,
          "userData",
          `${username}.json`
        );

        fs.readFile(userFilePath, "utf8", (err, data) => {
          let userData = {
            pantryItems: [],
            groceryItems: [],
            recipes: [],
            username,
          };

          if (!err && data) {
            try {
              userData = JSON.parse(data);
            } catch {
              res.writeHead(500, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({ message: "Corrupted user data file" })
              );
            }
          }

          if (listType === "pantry") {
            userData.pantryItems.push(item);
          } else if (listType === "grocery") {
            userData.groceryItems.push(item);
          } else if (listType === 'recipes') {
            userData.recipes.push(item);
          }else {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid list type" }));
          }

          fs.writeFile(
            userFilePath,
            JSON.stringify(userData, null, 2),
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(
                  JSON.stringify({ message: "Error saving user data" })
                );
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Inventory updated successfully" })
              );
            }
          );
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON data" }));
      }
    });
    return;
  }

  // Serve static files
  const filePath = path.join(
    publicDir,
    requestPath === "/" || requestPath === "" ? "/index.html" : requestPath
  );
  const contentType = getContentType(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`Server running at ${url}`);

  const platform = process.platform;
  if (platform === "win32") {
    exec(`start ${url}`);
  } else if (platform === "darwin") {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});
