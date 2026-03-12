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
        return res.status(400).json({
          success: false,
          message: "Invalid status type!",
        });
      }

      const validToUserID = await User.findById(toUserId);
      if (!validToUserID) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      const existingConnectionReq = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (fromUserId.toString() === toUserId) {
        return res.status(400).json({
          success: false,
          message: "You cannot send request to yourself!",
        });
      }

      if (existingConnectionReq)
        return res.status(409).json({
          success: false,
          message: "Connection already exists!",
        });

      const connReq = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connReq.save();

      res.status(201).json({
        success: true,
        message: `${req.user.firstName} marked ${status} for ${validToUserID.firstName}`,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
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
        return res.status(400).json({
          success: false,
          message: "Invalid status type!",
        });

      const connRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser,
        status: "interested",
      });

      if (!connRequest)
        return res.status(404).json({
          success: false,
          message: "Connection Request Not Found!",
        });

      connRequest.status = status;

      const data = await connRequest.save();

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
);

module.exports = connectionRequestRouter;
