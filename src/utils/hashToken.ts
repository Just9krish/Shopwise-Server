import crypto from "crypto";

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};

export default hashToken;
