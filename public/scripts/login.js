// loginRoute.js or in your main server file
import express from "express";
import fs from "fs/promises";
const router = express.Router();

router.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await fs.readFile("login.json", "utf-8"); // adjust path if needed
    const users = JSON.parse(data); // users is a JS object acting like a hashmap

    if (users[username] && users[username] === password) {
      res.sendStatus(200); // success
    } else {
      res.sendStatus(401); // unauthorized
    }
  } catch (err) {
    console.error("Error reading login file:", err);
    res.sendStatus(500); // server error
  }
});

export default router;
