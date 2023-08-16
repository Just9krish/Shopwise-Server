import crypto from "crypto";

const createToken = (userId: string): string => {
  return crypto.randomBytes(32).toString("hex") + userId;
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};

export { hashToken, createToken };
