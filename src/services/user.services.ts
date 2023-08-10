import User, { UserDocument } from "../models/user.model";

export async function createUser(input: UserDocument) {
  try {
    return await User.create(input);
  } catch (error: any) {
    return new Error(error);
  }
}
