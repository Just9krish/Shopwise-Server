import mongoose, { Document, Schema } from "mongoose";

export interface UserTokenDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  vToken?: string;
  rToken?: string;
  lToken?: string;
  createdAt: Date;
  expiresAt: Date;
}

const userTokenSchema = new Schema<UserTokenDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  vToken: {
    type: String,
    default: "",
  },
  rToken: {
    type: String,
    default: "",
  },
  lToken: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const UserToken = mongoose.model<UserTokenDocument>(
  "UserToken",
  userTokenSchema
);
export default UserToken;
