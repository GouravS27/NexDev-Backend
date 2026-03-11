const express = require("express");
const { userAuth } = require("../middlewares/userAuth");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(201).send(user);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const allowedEdit = [
      "firstName",
      "lastName",
      "gender",
      "age",
      "photoUrl",
      "about",
      "skills",
    ];

    const editAllowed = Object.keys(req.body).every((field) =>
      allowedEdit.includes(field),
    );

    if (!editAllowed) {
      return res.status(400).send("Requested field is not editable!");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((e) => (loggedInUser[e] = req.body[e]));

    await loggedInUser.save();

    // res.send(`${loggedInUser.firstName} profile is updated!`);
    res.status(200).json({
      success: true,
      message: `${loggedInUser.firstName} profile is updated!`,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = profileRouter;
