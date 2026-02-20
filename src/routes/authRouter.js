const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

const User = require("../models/user");
const { validateSignUp } = require("../utils/validate");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { firstName, lastName, email, password } = req.body;

    // Encryption
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);

    // Creating Instance
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.send("User Added!");
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) throw new Error("Wrong Password!");

    const token = await jwt.sign({ _id: user._id }, "SecretKey@123");
    res.cookie("token", token);

    res.send(`User: ${user.firstName} is logged in!`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!");
});

module.exports = authRouter;
