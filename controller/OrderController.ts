import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { OrderRequestBody, OrderRecord } from "../model/Order.type.js";
import * as core from "express-serve-static-core";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ensureAuthorization } from "../utills/auth.js";
import httpStatusCode from "../utills/httpStatusCode.js";
import jwt from "jsonwebtoken";

export const order = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    res: Response,
) => {
    try {
        const userId = ensureAuthorization(req);
        // INSERT deliveries
        const { deliveryResult, deliveryId } = await insertDeliveries(req);

        // INSERT orders
        const { orderResult, orderId } = await insertOrders(req, deliveryId, userId);

        // INSERT orderedBook
        const orderedBookResult = await insertOrderedBooks(req, orderId);

        // DELETE cartItems
        const cartItemResult = await deleteCartItems(req);

        res.json([deliveryResult, orderResult, orderedBookResult, cartItemResult]);
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};

const insertDeliveries = async (req: Request<core.ParamsDictionary, any, OrderRequestBody>) => {
    const { delivery } = req.body;
    const { address, contact, receiver } = delivery;
    const deliverySQL = "INSERT INTO `deliveries` (??) VALUES (?)";
    const deliveryValues = [
        ["receiver", "contact", "address"],
        [receiver, contact, address],
    ];
    const [deliveryResult] = await mariadb.query<ResultSetHeader>(deliverySQL, deliveryValues);
    if (deliveryResult.affectedRows) {
        const deliveryId = deliveryResult.insertId;
        return { deliveryResult, deliveryId };
    } else {
        throw new Error("배송 정보 입력에 문제가 발생했습니다.");
    }
};

const insertOrders = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    deliveryId: number,
    userId: number,
) => {
    const { totalPrice, totalQuantity, firstBookTitle } = req.body;

    const orderSQL = "INSERT INTO `orders` (??) VALUES (?)";
    const orderValues = [
        ["user_id", "total_quantity", "total_price", "book_title", "delivery_id"],
        [userId, totalQuantity, totalPrice, firstBookTitle, deliveryId],
    ];
    const [orderResult] = await mariadb.query<ResultSetHeader>(orderSQL, orderValues);

    if (orderResult.affectedRows) {
        const orderId = orderResult.insertId;
        return { orderResult, orderId };
    } else {
        throw new Error("주문 정보 입력에 문제가 발생했습니다.");
    }
};

const insertOrderedBooks = async (
    req: Request<core.ParamsDictionary, any, OrderRequestBody>,
    orderId: number,
) => {
    const { orderItems } = req.body;
    const cartItemSQL = "SELECT `book_id`, `quantity` FROM `cartItems` WHERE `id` IN (?)";
    const [cartItemResults] = await mariadb.query<RowDataPacket[]>(cartItemSQL, [orderItems]);

    if (!cartItemResults.length) {
        throw new ReferenceError("장바구니에 해당 아이템이 존재하지 않습니다.");
    }
    const orderedBookSQL = "INSERT INTO `orderedBooks` (??) VALUES ?";
    const orderedBookCols = ["book_id", "order_id", "quantity"];
    const orderedBookValues: number[][] = [];

    cartItemResults.forEach((item) => {
        const { book_id, quantity } = item;
        orderedBookValues.push([book_id, orderId, quantity]);
    });

    const [orderedBookResult] = await mariadb.query<ResultSetHeader>(orderedBookSQL, [
        orderedBookCols,
        orderedBookValues,
    ]);

    if (orderedBookResult.affectedRows) return orderedBookResult;
    else throw new Error("주문 도서 입력에 문제가 발생했습니다.");
};

const deleteCartItems = async (req: Request<core.ParamsDictionary, any, OrderRequestBody>) => {
    const { orderItems } = req.body;
    const cartItemSQL = "DELETE FROM `cartItems` WHERE `id` IN (?)";
    const [cartItemResult] = await mariadb.query<ResultSetHeader>(cartItemSQL, [orderItems]);
    if (cartItemResult.affectedRows) return cartItemResult;
    else throw new Error("장바구니 도서 삭제에 문제가 발생했습니다.");
};

export const fetchAllOrders = async (req: Request, res: Response) => {
    try {
        const userId = ensureAuthorization(req);
        const sql = `SELECT o.id, d.address, d.receiver, d.contact, o.book_title, o.total_quantity, o.total_price, o.ordered_at FROM orders AS o
                    LEFT JOIN deliveries AS d
                    ON o.delivery_id = d.id
                    WHERE user_id = ?`;
        const [results] = await mariadb.query<RowDataPacket[]>(sql, userId);
        if (results.length) {
            results.forEach((result) => {
                result.bookTitle = result.book_title;
                result.totalQuantity = result.total_quantity;
                result.totalPrice = result.total_price;
                result.orderedAt = result.ordered_at;
                delete result.book_title;
                delete result.total_quantity;
                delete result.total_price;
                delete result.ordered_at;
            });
            res.json(results);
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};

export const fetchOrder = async (req: Request, res: Response) => {
    try {
        const userId = ensureAuthorization(req);
        const { id } = req.params;
        const sql = `SELECT ob.book_id, b.title, b.author, b.price, ob.quantity
                    FROM orderedBooks AS ob
                    LEFT JOIN books AS b
                    ON ob.book_id = b.id
                    LEFT JOIN orders AS o
                    ON ob.order_id = o.id
                    WHERE o.user_id = ? AND ob.order_id = ?`;
        const [results] = await mariadb.query<RowDataPacket[]>(sql, [userId, id]);
        if (results.length) {
            results.forEach((result) => {
                result.bookId = result.book_id;
                delete result.book_id;
            });
            res.json(results);
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};
