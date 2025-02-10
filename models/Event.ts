import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  user_id: Schema.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  start_time: Date;
  end_time: Date;
  email_id: Schema.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  start_time: Date,
  end_time: Date,
  email_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Email",
  },
});

export const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
