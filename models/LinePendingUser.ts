import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILinePendingUser extends Document {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  lastMessage?: string;
  status: "pending" | "linked" | "ignored";
  linkedUserId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const LinePendingUserSchema: Schema<ILinePendingUser> = new Schema(
  {
    lineUserId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      default: "LINE User",
      trim: true,
    },
    pictureUrl: {
      type: String,
      default: "",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "linked", "ignored"],
      default: "pending",
      index: true,
    },
    linkedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

delete (mongoose.models as any).LinePendingUser;

const LinePendingUser: Model<ILinePendingUser> =
  mongoose.models.LinePendingUser ||
  mongoose.model<ILinePendingUser>("LinePendingUser", LinePendingUserSchema);

export default LinePendingUser;
