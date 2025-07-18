import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "24kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "24kb",
  }),
);

app.use(express.static("public"));

app.use(cookieParser());

//routes imports

import userRouter from "./routes/User.routes.js";

//routes declaration
app.use("/api/v1.0/users", userRouter)

//https://localhost:Port/api/v1.0/users



export default app;
