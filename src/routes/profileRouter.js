const express = require("express");
const { userAuth } = require("../middlewares/userAuth");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.send("Error: " + err.message);
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
      throw new Error("Non Editable Field!");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((e) => (
      loggedInUser[e] = req.body[e]
    ));

    await loggedInUser.save();

    res.send(`${loggedInUser.firstName} profile is updated!`);
  } catch (err) {
    res.send(err.message);
  }
});


module.exports = profileRouter;
