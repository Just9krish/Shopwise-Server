import mongoose, { Schema, model, Document } from "mongoose";
import { genSalt, compare, hashSync } from "bcrypt";
import { sign } from "jsonwebtoken";
import config from "config";

export interface UserInput {
  name: string;
  password: string;
  email: string;
}

export interface UserAddressInput {
  _id?: Document["_id"];
  country: string;
  state: string;
  address1: string;
  address2: string;
  address3?: string;
  zipcode: number;
  addressType: string;
}

export interface UserDocument extends UserInput, Document {
  primaryPhoneNumber?: number;
  secondaryPhoneNumber?: number;
  addresses: UserAddressInput[];
  role?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getJwtToken(): string;
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name!"],
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Please enter your email!"],
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Please enter your password!"],
      minLength: [6, "Password should be minimun 6 character!"],
      select: false,
    },

    primaryPhoneNumber: {
      type: Number,
      trim: true,
    },

    secondaryPhoneNumber: {
      type: Number,
      trim: true,
    },

    addresses: [
      {
        country: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        address1: {
          type: String,
          required: true,
          trim: true,
        },
        address2: {
          type: String,
          required: true,
          trim: true,
        },
        address3: {
          type: String,
          trim: true,
        },
        zipcode: {
          type: Number,
          required: true,
          trim: true,
        },
        addressType: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    role: {
      type: String,
      default: "user",
    },

    avatar: {
      type: String,
      default: "https://i.ibb.co/kK2JV13/Png-Item-1503945.png",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  const user = this as UserDocument;

  if (!user.isModified("password")) {
    next();
  }

  const SALT_WORK_FACTOR = +process.env.SALT_WORK_FACTOR!;

  const salt = await genSalt(SALT_WORK_FACTOR);

  user.password = await hashSync(user.password, salt);
});

// const JWT_SECRET = config.get<string>("jwtSecret");
const JWT_SECRET = process.env.JWT_SECRET!;

// jwt token
userSchema.methods.getJwtToken = function () {
  return sign({ id: this._id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// comapre password
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  const user = this as UserDocument;
  return await compare(enteredPassword, user.password);
};

const User = model<UserDocument>("User", userSchema);

export default User;
