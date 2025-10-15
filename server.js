const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve index.html from 'public' folder

const MENU_FILE = './menu.json';
const ORDERS_FILE = './orders.json';

// Helper to read/write JSON
async function readJSON(file){ return fs.readJson(file).catch(()=>[]); }
async function writeJSON(file,data){ return fs.writeJson(file,data,{spaces:2}); }

// --- Routes ---
// Get menu
app.get('/menu', async (req,res)=>{
  const menu = await readJSON(MENU_FILE);
  res.json(menu);
});

// Add menu item
app.post('/menu', async (req,res)=>{
  const menu = await readJSON(MENU_FILE);
  const item = {...req.body, id:Date.now()};
  menu.push(item);
  await writeJSON(MENU_FILE,menu);
  res.json(item);
});

// Remove menu item
app.delete('/menu/:id', async (req,res)=>{
  const menu = await readJSON(MENU_FILE);
  const newMenu = menu.filter(i=>i.id != req.params.id);
  await writeJSON(MENU_FILE,newMenu);
  res.json({success:true});
});

// Get orders
app.get('/orders', async (req,res)=>{
  const orders = await readJSON(ORDERS_FILE);
  res.json(orders);
});

// Add order
app.post('/orders', async (req,res)=>{
  const orders = await readJSON(ORDERS_FILE);
  const order = {...req.body, id:Date.now()};
  orders.push(order);
  await writeJSON(ORDERS_FILE,orders);
  res.json(order);
});

// Update order status
app.put('/orders/:id', async (req,res)=>{
  const orders = await readJSON(ORDERS_FILE);
  const order = orders.find(o=>o.id==req.params.id);
  if(order) order.status = req.body.status;
  await writeJSON(ORDERS_FILE,orders);
  res.json(order);
});

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
