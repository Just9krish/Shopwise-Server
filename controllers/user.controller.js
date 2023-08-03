const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const Token = require("../models/token.model");
const ErrorHandler = require("../utils/errorHandler");
const { sendMail } = require("../utils/sendMail");
const { sendToken } = require("../utils/jwtToken");
const { hashToken } = require("../utils/hashToken");

const CLIENT_DOMAIN =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.CLIENT_DOMAIN_PRO
    : process.env.CLIENT_DOMAIN_DEV;

// register user
exports.createUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const user = await User.create({
      name: name,
      email: email,
      password: password,
    });

    // Delete Token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
      await token.deleteOne();
    }

    //   Create Verification Token and Save
    const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

    const hashedToken = hashToken(verificationToken);
    await new Token({
      userId: user._id,
      vToken: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000), // 60mins
    }).save();

    const verificationUrl = `${CLIENT_DOMAIN}/user/verify/${verificationToken}`;

    const subject = "Verify Your Account - Shopwise";
    const send_to = user.email;
    const sent_from = process.env.SMPT_MAIL;
    const reply_to = "noreply@shopwise.com";
    const template = "verifyEmail";
    const link = verificationUrl;
    const logoUrl = process.env.SHOP_LOGO;

    try {
      await sendMail(
        subject,
        send_to,
        sent_from,
        reply_to,
        template,
        user.name,
        link,
        logoUrl
      );

      res.status(200).json({
        success: true,
        message: `Verification Email Sent`,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler("Failed to send activation email", 500));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Failed to create user", 500));
  }
};

// activate user account
exports.activation = async (req, res, next) => {
  try {
    const { activation_token } = req.body;

    const hashedToken = hashToken(activation_token);

    const userToken = await Token.findOne({
      vToken: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
      return next(new ErrorHandler("Invalid or Expired Token", 404));
    }

    const user = await User.findById(userToken.userId);

    if (user.isEmailVerified) {
      res.status(400);
      throw new Error("User is already verified");
    }

    user.isEmailVerified = true;
    await user.save();

    sendToken(user, 201, res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Failed to create user", 500));
  }
};

// login user
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please provide all the fields", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("User doesn't exist", 404));
    }

    if (!user.isEmailVerified) {
      return next(new ErrorHandler("Email is not verified", 400));
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new ErrorHandler("Wrong Password", 400));
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Failed to login user", 500));
  }
};

// get user information
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User does't exist", 404));
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 500));
  }
};

// forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return next(new ErrorHandler("No user with this email", 400));
    }

    // Delete Token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
      await token.deleteOne();
    }

    //   Create Verification Token and Save
    const resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // hash token
    const hashedToken = hashToken(resetToken);

    await new Token({
      userId: user._id,
      rToken: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000), // 60mins
    }).save();

    // Construct Reset URL
    const resetUrl = `${CLIENT_DOMAIN}/resetPassword/${resetToken}`;

    // Send Email
    const subject = "Password Reset Request - Shopwise";
    const send_to = user.email;
    const sent_from = process.env.SMPT_MAIL;
    const reply_to = "noreply@shopwise.com";
    const template = "forgotPassword";
    const name = user.name;
    const link = resetUrl;
    const logoUrl = process.env.SHOP_LOGO;

    try {
      await sendMail(
        subject,
        send_to,
        sent_from,
        reply_to,
        template,
        name,
        link,
        logoUrl
      );
      res.status(200).json({ message: "Password Reset Email Sent" });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler("Email not sent, please try again", 500));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 500));
  }
};

// reset user password
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const hashedToken = hashToken(resetToken);

    const userToken = await Token.findOne({
      rToken: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
      return next(new ErrorHandler("Invalid or Expired Token", 404));
    }

    const user = User.findById(userToken.userId);
    user.password = password;

    await user.save();
    res
      .status(200)
      .json({ message: "Password Reset Successful, please login" });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 500));
  }
};

// update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, password, primaryPhoneNumber, secondaryPhoneNumber, name } =
      req.body;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new ErrorHandler("Enter Correct Password", 400));
    }

    user.name = name;
    user.email = email;
    user.primaryPhoneNumber = primaryPhoneNumber;
    user.secondaryPhoneNumber = secondaryPhoneNumber;

    await user.save();

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// update user profile picture
exports.updateUserProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const existingUser = await User.findById(userId);

    const existingPath = `uploads/${existingUser.avatar}`;
    fs.unlinkSync(existingPath);
    const filepath = path.join(req.file.filename);

    const user = await User.findByIdAndUpdate(userId, { avatar: filepath });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// add user address
exports.addUserAdress = async (req, res, next) => {
  try {
    const {
      country,
      state,
      address1,
      address2,
      address3,
      zipcode,
      addressType,
    } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sameTypeAdress = user.addresses.find(
      (address) => address.addressType === addressType
    );

    if (sameTypeAdress) {
      return next(new ErrorHandler(`${addressType} already exists`, 400));
    }

    user.addresses.push({
      country,
      state,
      address1,
      address2,
      address3,
      zipcode,
      addressType,
    });

    await user.save();

    res.status(201).json({ message: "Address added successfully", user });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// user can delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const addressId = req.params.addressId;

    const address = user.addresses.find((address) => address._id == addressId);

    if (!address) {
      return next(new ErrorHandler("Address not found", 404));
    }

    user.addresses.pull(addressId);

    await user.save();

    res.status(201).json({ message: "Address deleted successfully", user });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// user change password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    if (newPassword != confirmNewPassword) {
      return next(
        new ErrorHandler(
          "New password is not match with confrimed password",
          400
        )
      );
    }
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// log out user
exports.logOutUser = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(201).json({ success: true, message: "Log out Successful!" });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};

// get all user orders
exports.getAllOrdersOfUser = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const userOrders = await Order.find({ user: userID }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, orders: userOrders });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message, 500));
  }
};
