import express from "express";
import fs from "fs/promises";
const router = express.Router();

//Check if login credentials are correct
router.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await fs.readFile("login.json", "utf-8"); 
    const users = JSON.parse(data); 

    if (users[username] && users[username] === password) {
      res.sendStatus(200); 
    } else {
      res.sendStatus(401); 
    }
  } catch (err) {
    console.error("Error reading login file:", err);
    res.sendStatus(500); 
  }
});

export default router;