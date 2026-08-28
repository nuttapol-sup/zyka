import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserLog extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  name: string;
  role: "admin" | "user";
  currentPath: string;
  status: "online" | "offline";
  lastActive: Date;
  loginTime: Date;
  logoutTime?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserLogSchema: Schema<IUserLog> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    currentPath: {
      type: String,
      default: "/dashboard",
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const UserLog: Model<IUserLog> =
  mongoose.models.UserLog || mongoose.model<IUserLog>("UserLog", UserLogSchema);

export default UserLog;
