import { config } from "dotenv";
import express from "express";
import cors from "cors";

config({ path: ".env.local" });

const app = express();
const PORT = 8081;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Mock API endpoints for the POC
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ]);
});

app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Product A", price: 29.99, category: "Electronics" },
    { id: 2, name: "Product B", price: 49.99, category: "Clothing" },
    { id: 3, name: "Product C", price: 19.99, category: "Books" },
  ]);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
