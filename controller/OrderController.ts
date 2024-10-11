import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { OrderRequestBody } from "../model/Order.type.js";
import * as core from "express-serve-static-core";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const order = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
) => {
    const { userId, items, delivery, totalPrice, totalQuantity, firstBookTitle } = req.body;
    const { address, contact, receiver } = delivery;
    const deliverySQL = "INSERT INTO `deliveries` (??) VALUES (?)";
    const deliveryValues = [
        ["receiver", "contact", "address"],
        [receiver, contact, address],
    ];

    // INSERT deliveries
    const [deliveryResults] = await mariadb.query<ResultSetHeader>(deliverySQL, deliveryValues);

    // INSERT orders
    const orderSQL = "INSERT INTO `orders` (??) VALUES (?)";
    const orderValues = [
        ["user_id", "total_quantity", "total_price", "book_title", "delivery_id"],
        [userId, totalQuantity, totalPrice, firstBookTitle, deliveryResults.insertId],
    ];

    const [orderResults] = await mariadb.query<ResultSetHeader>(orderSQL, orderValues);

    // INSERT orderedBook
    const orderedBookSQL = "INSERT INTO `orderedBooks` (??) VALUES ?";
    const orderedBookCols = ["book_id", "order_id", "quantity"];
    const orderedBookValues: number[][] = [];
    orderedBookValues.push();
    items.forEach((item) => {
        const { bookId, quantity } = item;
        orderedBookValues.push([bookId, orderResults.insertId, quantity]);
    });

    const [orderedBookResults] = await mariadb.query<ResultSetHeader>(orderedBookSQL, [
        orderedBookCols,
        orderedBookValues,
    ]);

    res.json([deliveryResults, orderResults, orderedBookResults]);
};

export const fetchAllOrders = async (req: Request, res: Response) => {
    res.json("전체 주문 목록 조회");
};

export const fetchOrder = async (req: Request, res: Response) => {
    res.json("주문 상품 상세 조회");
};
