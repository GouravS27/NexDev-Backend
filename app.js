const express = require("express");
const connectDB = require("./src/config/db");
const authRouter = require("./src/routes/authRouter");
const profileRouter = require("./src/routes/profileRouter");
const connectionRequest = require("./src/routes/connectionRequestRouter")

require("dotenv").config();
const cookieParser = require("cookie-parser");
const userRouter = require("./src/routes/userRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/",connectionRequest);
app.use("/",userRouter);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on PORT ${process.env.PORT}!`);
    });
  })
  .catch((err) => {
    console.log(`Server Error: ${err.message}`);
  });
