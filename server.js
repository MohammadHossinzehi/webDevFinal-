const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// Helper to get content type based on file extension
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
  // Normalize URL, remove query params if any
  let requestPath = req.url.split("?")[0];
  
  if (requestPath === "/" || requestPath === "") {
    requestPath = "/index.html"; // Serve index.html by default
  }

  // Handle API endpoint for updating inventory
  if (req.method === "POST" && requestPath === "/update-inventory") {
    let body = "";
    
    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const { listType, item } = JSON.parse(body);
        const filePath = path.join(publicDir, "data.json");

        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error reading data.json");
            return;
          }

          let inventoryData = JSON.parse(data);

          // Ensure pantryItems and groceryItems arrays exist
          if (!inventoryData.pantryItems) {
            inventoryData.pantryItems = [];
          }
          if (!inventoryData.groceryItems) {
            inventoryData.groceryItems = [];
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
          

          // Write updated data back to data.json
          fs.writeFile(filePath, JSON.stringify(inventoryData, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Error updating data.json");
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
      } catch (error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON data");
      }
    });

    return; // End request handling for /update-inventory
  }

  // Serve static files
  const filePath = path.join(publicDir, requestPath);
  const contentType = getContentType(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File not found
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
      } else {
        // Other server error
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
  console.log(`Server running at http://localhost:${PORT}/`);

  // Open browser automatically
  const platform = process.platform;
  if (platform === "win32") {
    exec(`start ${url}`); // Windows
  } else if (platform === "darwin") {
    exec(`open ${url}`); // macOS
  } else {
    exec(`xdg-open ${url}`); // Linux
  }
});
