const express = require("express");
const { userAuth } = require("../middlewares/userAuth");

const connectionRequestRouter = express.Router();

const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.send("Invalid status type!");
      }

      const validToUserID = await User.findById(toUserId);
      if (!validToUserID) return res.send("User Not Found!");

      const existingConnectionReq = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (fromUserId.equals(toUserId))
        return res.send("Unable to Send to Self!");

      if (existingConnectionReq) return res.send("Connection Already Exists!");

      const connReq = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connReq.save();

      res.send(
        `Status is ${status} for ${req.user.firstName} and ${validToUserID.firstName} `,
      );
    } catch (err) {
      res.send(err.message);
    }
  },
);

connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status))
        return res.send("Invalid Status Type!");

      const connRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser,
        status: "interested",
      });

      if (!connRequest) return res.send("Connection Request Not Found!");

      connRequest.status = status;

      const data = await connRequest.save();

      res.send(data);
    } catch (err) {
      res.send(err.message);
    }
  },
);

module.exports = connectionRequestRouter;
