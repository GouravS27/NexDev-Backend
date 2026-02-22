const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const connectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const data = await connectionRequest
      .find({
        toUserId: loggedInUser,
        status: "interested",
      })
      .populate("fromUserId", USER_SAFE_DATA);

    res.send(data);
  } catch (err) {
    res.send(err.message);
  }
});

userRouter.get('/user/connections',userAuth,async (req,res)=>{
    try{
        const loggedInUser = req.user;

        const connReq = await connectionRequest.find({
            $or:[
                {fromUserId:loggedInUser,status:"accepted"},
                {toUserId:loggedInUser,status:"accepted"}
            ]
        }).populate("fromUserId",USER_SAFE_DATA)
          .populate("toUserId",USER_SAFE_DATA);

        // console.log(connReq)

        const data = connReq.map((row)=>{
            if(row.fromUserId._id.toString() === loggedInUser._id.toString())
                return row.toUserId;
            return row.fromUserId;
        });

        res.json({data});
    }
    
    catch(err){
        res.send(err.message);
    }
})

module.exports = userRouter;
