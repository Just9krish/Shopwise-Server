import app from "../app";
import * as UserService from "../services/user.service";
import supertest from "supertest";
import ErrorHandler from "../utils/errorHandler";
import mongoose from "mongoose";
import User, { UserDocument } from "../models/user.model";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { logOutUserHandler } from "../controllers/user.controller";

const userInput = {
  name: "John Doe",
  email: "rvamit2638@gmail.com",
  password: "Amit@123",
  confirmPassword: "Amit@123",
};

const validUser = {
  email: "rvamit2648@gmail.com",
  password: "Amit@123",
};

const userId = new mongoose.Types.ObjectId();

jest.mock("jsonwebtoken");
jest.mock("../models/user.model.ts");

const mockedJwtSecret = "mockedJwtSecret";
const mockedToken = "mockedToken";

beforeAll(() => {
  process.env.JWT_SECRET = mockedJwtSecret;
});

afterAll(() => {
  process.env.JWT_SECRET = undefined;
});

describe("User Routes", () => {
  // User Signup
  describe("User Signup", () => {
    it("should create a new user and send mail for email verification", async () => {
      // Remove confirmPassword property for this test
      const { confirmPassword, ...userInputWithoutConfirm } = userInput;

      const createUserServiceMock = jest
        .spyOn(UserService, "createUserAndSendVerificationEmail")
        .mockResolvedValueOnce({
          success: true,
          message: "Verification Email Sent",
        });

      const { statusCode, body } = await supertest(app)
        .post("/api/v2/users/signup")
        .send(userInput);

      expect(statusCode).toBe(201);
      expect(body.success).toEqual(true);

      expect(createUserServiceMock).toHaveBeenCalledWith(
        userInputWithoutConfirm
      );
    });

    it("should not create a new user if email is already in use", async () => {
      const { confirmPassword, ...userInputWithoutConfirm } = userInput;
      // Mock the createUserAndSendVerificationEmail function to throw an error
      const createUserServiceMock = jest
        .spyOn(UserService, "createUserAndSendVerificationEmail")
        .mockRejectedValueOnce(new ErrorHandler("Email already in use", 400));

      const { statusCode, body } = await supertest(app)
        .post("/api/v2/users/signup")
        .send(userInput);

      expect(statusCode).toBe(400);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Email already in use");

      expect(createUserServiceMock).toHaveBeenCalledWith(
        userInputWithoutConfirm
      );
    });
  });

  // Login User
  describe("Login User", () => {
    it("should login a user and set a cookie with valid credentials", async () => {
      const loginUserServiceMock = jest
        .spyOn(UserService, "loginUserAndSetCookie")
        // @ts-ignore
        .mockResolvedValueOnce({
          name: "John Doe",
          email: "rvamit2648@outlook.com",
          isEmailVerified: true,
          addresses: [],
          _id: userId,
          getJwtToken: jest.fn().mockReturnValue(mockedToken),
        } as UserDocument);

      const { statusCode, body } = await supertest(app)
        .post("/api/v2/users/login")
        .send(validUser);

      expect(statusCode).toBe(200);
      expect(body.success).toEqual(true);

      expect(loginUserServiceMock).toHaveBeenCalledWith(validUser);
    });

    it("should return an error for invalid credentials", async () => {
      const loginUserServiceMock = jest
        .spyOn(UserService, "loginUserAndSetCookie")
        .mockRejectedValueOnce(new ErrorHandler("Invalid Credentials", 400));

      const { statusCode, body } = await supertest(app)
        .post("/api/v2/users/login")
        .send(validUser);

      expect(statusCode).toBe(400);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Invalid Credentials");

      expect(loginUserServiceMock).toHaveBeenCalledWith(validUser);
    });
  });

  describe("Get User Details", () => {
    it("should get user details for valid JWT token", async () => {
      const mockedUser = {
        _id: userId,
        name: "John Doe",
        email: "rvamit2648@outlook.com",
        isEmailVerified: true,
        addresses: [],
      };

      const getUserDetailsServiceMock = jest
        .spyOn(UserService, "getUserDetailsById")
        // @ts-ignore
        .mockResolvedValueOnce(mockedUser as UserDocument);

      (jwt.verify as jest.Mock).mockReturnValueOnce({ _id: userId });

      (User.findById as jest.Mock).mockResolvedValueOnce(
        // @ts-ignore
        mockedUser as UserDocument
      );

      const { statusCode, body } = await supertest(app)
        .get("/api/v2/users/getuser")
        .set("Cookie", [`token=${mockedToken}`]);

      expect(statusCode).toBe(200);
      expect(body.success).toEqual(true);

      expect(getUserDetailsServiceMock).toHaveBeenCalledWith(userId);
    });

    it("should return an error if JWT token is invalid", async () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce(() => {
        throw new ErrorHandler("Unauthorized", 401);
      });

      const { statusCode, body } = await supertest(app)
        .get("/api/v2/users/getuser")
        .set("Cookie", [`token=${mockedToken}`]);

      expect(statusCode).toBe(401);
      expect(body.success).toEqual(false);
      expect(body.message).toEqual("Unauthorized");
    });
  });

  // Log out user
});
