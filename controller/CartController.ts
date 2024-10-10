import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { CartRequestBody, JSONType } from "../model/Cart.type.js";
import httpStatusCode from "../utills/httpStatusCode.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import * as core from "express-serve-static-core";

export const addCartItem = async (
    req: Request<core.ParamsDictionary, any, CartRequestBody>,
    res: Response,
) => {
    const { bookId, quantity, userId } = req.body;
    const sql = "INSERT INTO `cartItems` (??) VALUES (?)";
    const values = [
        ["book_id", "user_id", "quantity"],
        [bookId, userId, quantity],
    ];
    try {
        const [results] = await mariadb.query(sql, values);
        res.json(results);
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

export const fetchAllCartItems = async (
    req: Request<core.ParamsDictionary, any, CartRequestBody>,
    res: Response,
) => {
    const { userId, selected } = req.body;
    let sql = `SELECT * FROM cartItems
                LEFT JOIN books
                ON cartItems.book_id = books.id
                WHERE user_id = ?`;
    const values: JSONType = [userId];
    if (selected) {
        sql += " AND cartItems.id IN (?);";
        values.push(selected);
    }

    try {
        const [results] = await mariadb.query<RowDataPacket[]>(sql, values);
        if (results.length) res.json(results);
        else res.status(httpStatusCode.NOT_FOUND).end();
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

export const removeCartItem = async (
    req: Request<core.ParamsDictionary, any, CartRequestBody>,
    res: Response,
) => {
    const { userId, cartItemId } = req.body;
    const sql = `DELETE FROM cartItems
                WHERE id = ? AND user_id = ?`;
    const values = [cartItemId, userId];
    try {
        const [results] = await mariadb.query<ResultSetHeader>(sql, values);
        if (results.affectedRows) res.json(results);
        else res.status(httpStatusCode.NOT_FOUND).end();
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};
