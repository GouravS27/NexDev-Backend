const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Token Expired!");
    }

    const decodedObj = await jwt.verify(token, "SecretKey@123");

    const { _id } = decodedObj;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User Not Found!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.send("Error: " + err.message);
  }
};
module.exports = {userAuth};