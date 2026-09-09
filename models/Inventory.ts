import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId | string;
  locationId?: mongoose.Types.ObjectId | string;
  zoneId?: mongoose.Types.ObjectId | string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema<IInventory> = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "กรุณาระบุสินค้า"],
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "StorageLocation",
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "inventories",
  }
);

// Compound index for unique product-location-zone stock record
InventorySchema.index({ productId: 1, locationId: 1, zoneId: 1 }, { unique: true });

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
