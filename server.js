const express = require("express");
const fs = require("fs-extra");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // serve index.html

const menuFile = path.join(__dirname, "menu.json");
const ordersFile = path.join(__dirname, "orders.json");

// ✅ Ensure JSON files exist
if (!fs.existsSync(menuFile)) {
  fs.writeJsonSync(menuFile, [
    { id: 1, name: "Chicken Biryani", price: 220, img: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Chicken-Biryani-Recipe-500x500.jpg" },
    { id: 2, name: "Mutton Biryani", price: 320, img: "https://i.ytimg.com/vi/7dLE0oraTF0/maxresdefault.jpg" }
  ]);
}
if (!fs.existsSync(ordersFile)) fs.writeJsonSync(ordersFile, []);

// ✅ Get all menu items
app.get("/menu", async (req, res) => {
  const data = await fs.readJson(menuFile);
  res.json(data);
});

// ✅ Add new menu item (owner)
app.post("/menu", async (req, res) => {
  const menu = await fs.readJson(menuFile);
  const newItem = { id: Date.now(), ...req.body };
  menu.push(newItem);
  await fs.writeJson(menuFile, menu);
  res.json({ success: true, message: "Item added", newItem });
});

// ✅ Get all orders
app.get("/orders", async (req, res) => {
  const orders = await fs.readJson(ordersFile);
  res.json(orders);
});

// ✅ Add a new order (from frontend)
app.post("/orders", async (req, res) => {
  const orders = await fs.readJson(ordersFile);
  const order = { id: Date.now(), ...req.body, status: "Pending" };
  orders.push(order);
  await fs.writeJson(ordersFile, orders);
  res.json({ success: true, message: "Order saved", order });
});

// ✅ Mark order complete
app.put("/orders/:id/complete", async (req, res) => {
  const orders = await fs.readJson(ordersFile);
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = "Completed";
  await fs.writeJson(ordersFile, orders);
  res.json({ success: true, message: "Order marked as completed" });
});

// ✅ Serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
