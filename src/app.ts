import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import authController from "./controllers/authController";
import userController from "./controllers/userController";
import imageController from "./controllers/imageController";
import productController from "./controllers/productController";
import articleController from "./controllers/articleController";
import commentController from "./controllers/commentController";
import errorHandler from "./middlewares/errorHandler";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:3001", // 프론트엔드 주소
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.use("/auth", authController);
app.use("/users", userController);
app.use("/products", productController);
app.use("/articles", articleController);
app.use("/uploads", express.static("uploads"));
app.use("/images", imageController);
app.use(commentController);
app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
