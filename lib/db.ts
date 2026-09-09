import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zyka_db";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      try {
        // Drop legacy indexes if they exist in MongoDB collections
        const db = mongooseInstance.connection.db;
        if (db) {
          const collections = await db.listCollections({ name: "users" }).toArray();
          if (collections.length > 0) {
            const usersCol = db.collection("users");
            const indexes = await usersCol.indexes();
            if (indexes.some((idx) => idx.name === "email_1")) {
              await usersCol.dropIndex("email_1");
              console.log("🧹 Dropped legacy email_1 index");
            }
          }

          const invCollections = await db.listCollections({ name: "inventories" }).toArray();
          if (invCollections.length > 0) {
            const invCol = db.collection("inventories");
            const invIndexes = await invCol.indexes();
            if (invIndexes.some((idx) => idx.name === "productId_1_locationId_1")) {
              await invCol.dropIndex("productId_1_locationId_1");
              console.log("🧹 Dropped legacy productId_1_locationId_1 index");
            }
          }
        }
      } catch (indexErr) {
        // Ignore index drop error if not exists
      }

      // Seed default admin user if none exists
      try {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount === 0) {
          const hashedPassword = await bcrypt.hash("admin123", 10);
          await User.create({
            name: "System Admin",
            username: "admin",
            password: hashedPassword,
            role: "admin",
            allowedPages: [
              "/dashboard",
              "/reports",
              "/analytics",
              "/admin/create-user",
              "/admin/manage-permissions",
            ],
          });
          console.log("✅ Seeded default admin account (username: admin / password: admin123)");
        }
      } catch (err) {
        console.error("Error auto-seeding default admin account:", err);
      }
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
