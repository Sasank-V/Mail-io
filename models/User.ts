import { defaultCategories } from "@/lib/constants";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  google_id: string;
  name: string;
  email: string;
  image: string;
  access_token: string;
  expires_at: number;
  refresh_token: string;
  categories: {
    name: string;
    description: string;
  }[];
  messages: {
    id: string;
    category: string;
    marked: boolean;
    event_ids: string[];
  }[];
}

const UserSchema = new Schema<IUser>({
  google_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Number,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  categories: {
    type: [
      {
        name: String,
        description: String,
      },
    ],
    required: true,
    default: defaultCategories,
  },
  messages: {
    type: [
      {
        id: String,
        category: String,
        marked: Boolean,
        event_ids: [String],
      },
    ],
    default: [{ id: "1", category: "Test", marked: false, event_ids: [] }],
  },
});

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
