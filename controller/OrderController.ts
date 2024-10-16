import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { OrderRequestBody, OrderRecord } from "../model/Order.type.js";
import * as core from "express-serve-static-core";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DeliveryRecord } from "../model/delivery.type.js";

export const order = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
) => {
    // INSERT deliveries
    const { deliveryResults, deliveryId } = await insertDeliveries(req, res);

    // INSERT orders
    const { orderResults, orderId } = await insertOrders(req, res, deliveryId);

    // INSERT orderedBook
    const orderedBookResults = await insertOrderedBooks(req, res, orderId);

    // DELETE cartItems
    const cartItemResults = await deleteCartItems(req, res);

    res.json([deliveryResults, orderResults, orderedBookResults, cartItemResults]);
};

const insertDeliveries = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
) => {
    const { delivery } = req.body;
    const { address, contact, receiver } = delivery;
    const deliverySQL = "INSERT INTO `deliveries` (??) VALUES (?)";
    const deliveryValues = [
        ["receiver", "contact", "address"],
        [receiver, contact, address],
    ];
    const [deliveryResults] = await mariadb.query<ResultSetHeader>(deliverySQL, deliveryValues);
    const deliveryId = deliveryResults.insertId;
    return { deliveryResults, deliveryId };
};

const insertOrders = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
    deliveryId: number,
) => {
    const { userId, totalPrice, totalQuantity, firstBookTitle } = req.body;

    const orderSQL = "INSERT INTO `orders` (??) VALUES (?)";
    const orderValues = [
        ["user_id", "total_quantity", "total_price", "book_title", "delivery_id"],
        [userId, totalQuantity, totalPrice, firstBookTitle, deliveryId],
    ];
    const [orderResults] = await mariadb.query<ResultSetHeader>(orderSQL, orderValues);
    const orderId = orderResults.insertId;

    return { orderResults, orderId };
};

const insertOrderedBooks = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
    orderId: number,
) => {
    const { orderItems } = req.body;
    const cartItemSQL = "SELECT `book_id`, `quantity` FROM `cartItems` WHERE `id` IN (?)";
    const [cartItemResults] = await mariadb.query<RowDataPacket[]>(cartItemSQL, [orderItems]);

    const orderedBookSQL = "INSERT INTO `orderedBooks` (??) VALUES ?";
    const orderedBookCols = ["book_id", "order_id", "quantity"];
    const orderedBookValues: number[][] = [];

    cartItemResults.forEach((item) => {
        const { book_id, quantity } = item;
        orderedBookValues.push([book_id, orderId, quantity]);
    });

    const [orderedBookResults] = await mariadb.query<ResultSetHeader>(orderedBookSQL, [
        orderedBookCols,
        orderedBookValues,
    ]);

    return orderedBookResults;
};

const deleteCartItems = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
) => {
    const { orderItems } = req.body;
    const cartItemSQL = "DELETE FROM `cartItems` WHERE `id` IN (?)";
    const [cartItemResults] = await mariadb.query<ResultSetHeader>(cartItemSQL, [orderItems]);
    return cartItemResults;
};

export const fetchAllOrders = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const sql = `SELECT o.id, d.address, d.receiver, d.contact, o.book_title, o.total_quantity, o.total_price, o.ordered_at FROM orders AS o
                LEFT JOIN deliveries AS d
                ON o.delivery_id = d.id
                WHERE user_id = ?`;
    const [results] = await mariadb.query<RowDataPacket[]>(sql, userId);
    res.json(results);
};

export const fetchOrder = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const { id } = req.params;
    const sql = `SELECT ob.book_id, b.title, b.author, b.price, ob.quantity
                FROM orderedBooks AS ob
                LEFT JOIN books AS b
                ON ob.book_id = b.id
                LEFT JOIN orders AS o
                ON ob.order_id = o.id
                WHERE o.user_id = ? AND ob.order_id = ?`;
    const [results] = await mariadb.query<RowDataPacket[]>(sql, [userId, id]);
    res.json(results);
};
