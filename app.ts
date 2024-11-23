import express from "express";
import cookieParser from "cookie-parser";
import usersRouter from "./routes/users.js";
import booksRouter from "./routes/books.js";
import likesRouter from "./routes/likes.js";
import cartsRouter from "./routes/carts.js";
import ordersRouter from "./routes/orders.js";
import categoryRouter from "./routes/category.js";
import cors from "cors";

const app = express();
app.listen(process.env.PORT);
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/likes", likesRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);
app.use("/category", categoryRouter);
