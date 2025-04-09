const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const createUserFileRoute = "/api/create-user-file";
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// Get content type based on file extension
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
  const createUserFileRoute = "/api/create-user-file";

  if (req.method === "POST" && requestPath === createUserFileRoute) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, data } = JSON.parse(body);
        if (!username || !data) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Invalid data" }));
        }

        const userFilePath = path.join(
          __dirname,
          "public",
          "userData",
          `${username}.json`
        );
        fs.writeFile(userFilePath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ message: "Failed to create file" })
            );
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: `File created for ${username}` }));
        });
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server error creating file" }));
      }
    });
    return;
  }

  // ✅ /update-inventory
  if (req.method === "POST" && requestPath === "/update-inventory") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, listType, item } = JSON.parse(body);
        if (!username || !listType || !item) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Missing data in request" }));
          return;
        }

        const userFilePath = path.join(
          publicDir,
          "userData",
          `${username}.json`
        );

        // Create file if it doesn't exist
        fs.readFile(userFilePath, "utf8", (err, data) => {
          let userData = {
            pantryItems: [],
            groceryItems: [],
            recipes: [],
            username: username,
          };

          if (!err && data) {
            try {
              userData = JSON.parse(data);
            } catch {
              // corrupted file fallback
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Corrupted user data file" }));
              return;
            }
          }

          // Add item to the correct list
          if (listType === "pantry") {
            userData.pantryItems.push(item);
          } else if (listType === "grocery") {
            userData.groceryItems.push(item);
          } else {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid list type" }));
            return;
          }

          // Save updated data
          fs.writeFile(
            userFilePath,
            JSON.stringify(userData, null, 2),
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Error saving user data" }));
                return;
              }

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Inventory updated successfully" })
              );
            }
          );
        });
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON data" }));
      }
    });
    return;
  }

  // ✅ /api/login
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
            res.end("Error reading login file");
            return;
          }

          // Add item to the appropriate list
          if (listType === "pantry") {
            const existingIndex = inventoryData.pantryItems.findIndex(
              (i) => i.name.trim().toLowerCase() === item.name.trim().toLowerCase()

            );
          
            if (existingIndex !== -1) {
              inventoryData.pantryItems[existingIndex] = item; // update
            } else {
              inventoryData.pantryItems.push(item); // add new
            }
          } else if (listType === "grocery") {
            const existingIndex = inventoryData.groceryItems.findIndex(
              (i) => i.name.trim().toLowerCase() === item.name.trim().toLowerCase()
            );
          
            if (existingIndex !== -1) {
              inventoryData.groceryItems[existingIndex] = item;
            } else {
              inventoryData.groceryItems.push(item);
            }
          }
          

          let users = {};
          if (data) {
            users = JSON.parse(data);
          }

          if (users[username]) {
            res.writeHead(409, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Username already exists" }));
            return;
          }

          users[username] = password;

          fs.writeFile(loginFile, JSON.stringify(users, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Error writing to login file" })
              );
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              message: "Inventory updated successfully",
              updatedInventory: {
                pantry: inventoryData.pantryItems,
                grocery: inventoryData.groceryItems
              }
            }));
          });
        });
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid request format" }));
      }
    });
    return;
  }
  // Handle API endpoint for removing an item
if (req.method === "POST" && requestPath === "/remove-item") {
  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const { listType, itemName } = JSON.parse(body);
      const filePath = path.join(publicDir, "data.json");

      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error reading data.json");
          return;
        }

        const inventoryData = JSON.parse(data);

        if (listType === "pantry") {
          inventoryData.pantryItems = inventoryData.pantryItems.filter(
            (item) => item.name.trim().toLowerCase() !== itemName.trim().toLowerCase()
          );
        } else if (listType === "grocery") {
          inventoryData.groceryItems = inventoryData.groceryItems.filter(
            (item) => item.name.trim().toLowerCase() !== itemName.trim().toLowerCase()
          );
        }

        fs.writeFile(filePath, JSON.stringify(inventoryData, null, 2), (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error saving data");
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            message: "Item removed successfully",
            updatedInventory: {
              pantry: inventoryData.pantryItems || [],
              grocery: inventoryData.groceryItems || []
            }
          }));
        });
      });
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid request body");
    }
  });

  return;
}


  // ✅ Serve static files
  let filePath = path.join(
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

// ✅ Start the server
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`✅ Server running at ${url}`);

  const platform = process.platform;
  if (platform === "win32") {
    exec(`start ${url}`); // Windows
  } else if (platform === "darwin") {
    exec(`open ${url}`); // macOS
  } else {
    exec(`xdg-open ${url}`); // Linux
  }
});
