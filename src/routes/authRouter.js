const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

const User = require("../models/user");
const { validateSignUp } = require("../utils/validate");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);

    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      ...req.body,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    const token = await jwt.sign({ _id: user._id }, "SecretKey@123");
    res.cookie("token", token);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.status(400).send("User Not Found!");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) return res.status(401).send("Wrong Password!");

    const token = await jwt.sign({ _id: user._id }, "SecretKey@123");
    res.cookie("token", token);

    res.status(200).send(user);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).send("Logout Successful!");
});

module.exports = authRouter;
