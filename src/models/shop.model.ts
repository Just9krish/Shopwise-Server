import { Document, Schema, model } from "mongoose";
import { compare, genSalt, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";

export interface ShopDocument extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: number;
  address: string;
  role: string;
  avatar: string;
  zipcode: number;
  isEmailVerified: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  getJwtToken: () => string;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const shopSchema = new Schema<ShopDocument>(
  {
    name: {
      type: String,
      required: [true, "Please enter your shop name!"],
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Please enter your email!"],
    },

    password: {
      type: String,
      required: [true, "Please enter your password!"],
      minLength: [6, "Password should be minimum 6 characters!"],
      select: false,
    },

    phoneNumber: {
      type: Number,
      required: true,
    },

    address: { type: String, required: true },

    role: {
      type: String,
      default: "seller",
    },

    avatar: {
      type: String,
      default: "https://i.ibb.co/kK2JV13/Png-Item-1503945.png",
    },

    zipcode: {
      type: Number,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    description: String,
  },
  { timestamps: true }
);

// Hash password
shopSchema.pre<ShopDocument>("save", async function (next) {
  const shop = this as ShopDocument;

  if (!shop.isModified("password")) {
    return next();
  }

  const salt = await genSalt(config.get<number>("saltWorkFactor"));

  shop.password = await hashSync(shop.password, salt);
});

// jwt token
shopSchema.methods.getJwtToken = function (): string {
  return jwt.sign({ id: this._id }, config.get<string>("jwtSecret"), {
    expiresIn: config.get<string>("jwtExpiration"),
  });
};

// comapre password
shopSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  const shop = this as ShopDocument;
  return await compare(enteredPassword, shop.password);
};

const Shop = model("Shop", shopSchema);

export default Shop;
