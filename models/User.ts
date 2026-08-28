import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  password?: string;
  role: "admin" | "user";
  allowedPages: string[];
  referId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อ-นามสกุล"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "กรุณากรอกชื่อผู้ใช้ (Username)"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "กรุณากรอกรหัสผ่าน"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    allowedPages: {
      type: [String],
      default: ["/dashboard"],
    },
    referId: {
      type: Schema.Types.ObjectId,
      ref: "Refer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Delete password from JSON serialization for security
UserSchema.set("toJSON", {
  transform: function (_doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
