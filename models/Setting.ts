import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string;
  logoUrl?: string;
  appName: string;
  appSubtitle: string;
  companyAddress?: string;
  companyPhone?: string;
  companyTaxId?: string;
  menuOrder?: string[];
  reportsSubOrder?: string[];
  dataRecordsSubOrder?: string[];
  manageSubOrder?: string[];
  updatedAt: Date;
}

const SettingSchema: Schema<ISetting> = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "app_settings",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    appName: {
      type: String,
      default: "ZYKA",
    },
    appSubtitle: {
      type: String,
      default: "Access Control",
    },
    companyAddress: {
      type: String,
      default: "",
    },
    companyPhone: {
      type: String,
      default: "",
    },
    companyTaxId: {
      type: String,
      default: "",
    },
    menuOrder: {
      type: [String],
      default: ["dashboard", "reports", "analytics", "datarecords", "manage"],
    },
    reportsSubOrder: {
      type: [String],
      default: ["sales", "charts", "customer", "product", "user"],
    },
    dataRecordsSubOrder: {
      type: [String],
      default: ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "customers"],
    },
    manageSubOrder: {
      type: [String],
      default: ["create-user", "manage-permissions", "manage-menu-order", "manage-logo", "user-logs"],
    },
  },
  {
    timestamps: true,
  }
);

const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;
