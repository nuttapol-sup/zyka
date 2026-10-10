/**
 * Script to import/seed Zones, Positions, and Personnel into MongoDB
 * Usage:
 *   node scripts/seed-master-data.js
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// 1. Resolve MongoDB Connection String
let mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zyka_db";

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/MONGODB_URI=([^\r\n]+)/);
  if (match) {
    mongoUri = match[1].trim();
  }
}

async function run() {
  console.log("==========================================");
  console.log("ZYKA MASTER DATA IMPORT");
  console.log("==========================================");
  console.log("Connecting to MongoDB:", mongoUri);

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully!\n");

  const db = mongoose.connection.db;

  // 1. Import Zones
  const zonesPath = path.join(__dirname, "..", "data", "zones.json");
  if (fs.existsSync(zonesPath)) {
    const zones = JSON.parse(fs.readFileSync(zonesPath, "utf8"));
    console.log(`[1/3] Syncing ${zones.length} Zones...`);
    let count = 0;
    for (const item of zones) {
      const id = new mongoose.Types.ObjectId(item._id);
      const doc = { ...item, _id: id };
      if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
      if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
      await db.collection("zones").replaceOne({ _id: id }, doc, { upsert: true });
      count++;
    }
    console.log(`      ✓ Imported/Updated ${count} zones successfully.`);
  } else {
    console.warn("      ⚠️ data/zones.json not found.");
  }

  // 2. Import Positions
  const positionsPath = path.join(__dirname, "..", "data", "positions.json");
  if (fs.existsSync(positionsPath)) {
    const positions = JSON.parse(fs.readFileSync(positionsPath, "utf8"));
    console.log(`\n[2/3] Syncing ${positions.length} Positions...`);
    let count = 0;
    for (const item of positions) {
      const id = new mongoose.Types.ObjectId(item._id);
      const doc = { ...item, _id: id };
      if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
      if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
      await db.collection("positions").replaceOne({ _id: id }, doc, { upsert: true });
      count++;
    }
    console.log(`      ✓ Imported/Updated ${count} positions successfully.`);
  } else {
    console.warn("      ⚠️ data/positions.json not found.");
  }

  // 3. Import Personnel
  const personnelPath = path.join(__dirname, "..", "data", "personnel.json");
  if (fs.existsSync(personnelPath)) {
    const personnel = JSON.parse(fs.readFileSync(personnelPath, "utf8"));
    console.log(`\n[3/3] Syncing ${personnel.length} Personnel...`);
    let count = 0;
    for (const item of personnel) {
      const id = new mongoose.Types.ObjectId(item._id);
      const doc = { ...item, _id: id };
      if (doc.createdAt) doc.createdAt = new Date(doc.createdAt);
      if (doc.updatedAt) doc.updatedAt = new Date(doc.updatedAt);
      await db.collection("refers").replaceOne({ _id: id }, doc, { upsert: true });
      count++;
    }
    console.log(`      ✓ Imported/Updated ${count} personnel successfully.`);
  } else {
    console.warn("      ⚠️ data/personnel.json not found.");
  }

  console.log("\n==========================================");
  console.log("All data synchronized successfully!");
  console.log("==========================================");
  process.exit(0);
}

run().catch((err) => {
  console.error("\n❌ Error importing data:", err.message);
  process.exit(1);
});
