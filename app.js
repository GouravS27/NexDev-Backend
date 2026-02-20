const express = require("express");
const connectDB = require("./src/config/db");
const authRouter = require("./src/routes/authRouter");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use("/", authRouter);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on PORT ${process.env.PORT}!`);
    });
  })
  .catch((err) => {
    console.log(`Server Error: ${err.message}`);
  });
