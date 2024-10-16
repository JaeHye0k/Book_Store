import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { CartRequestBody, JSONType } from "../model/Cart.type.js";
import httpStatusCode from "../utills/httpStatusCode.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import * as core from "express-serve-static-core";
import { ensureAuthorization } from "../utills/getUserIdFromJWT.js";
import jwt from "jsonwebtoken";

export const addCartItem = async (
    req: Request<core.ParamsDictionary, any, CartRequestBody>,
    res: Response,
) => {
    try {
        const { bookId, quantity } = req.body;

        const userId = ensureAuthorization(req);

        const sql = "INSERT INTO `cartItems` (??) VALUES (?)";
        const values = [
            ["book_id", "user_id", "quantity"],
            [bookId, userId, quantity],
        ];

        const [results] = await mariadb.query(sql, values);
        res.json(results);
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

export const fetchAllCartItems = async (
    req: Request<core.ParamsDictionary, any, CartRequestBody>,
    res: Response,
) => {
    try {
        const { selected } = req.body;

        const userId = ensureAuthorization(req);

        let sql = `SELECT c.id, c.book_id, c.quantity, b.img, b.title, b.price FROM cartItems AS c
                LEFT JOIN books AS b
                ON c.book_id = b.id
                WHERE user_id = ?`;
        const values: JSONType = [userId];
        if (selected) {
            sql += " AND c.id IN (?);";
            values.push(selected);
        }

        const [results] = await mariadb.query<RowDataPacket[]>(sql, values);
        if (results.length) res.json(results);
        else res.status(httpStatusCode.NOT_FOUND).end();
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};

export const removeCartItem = async (
    req: Request<core.ParamsDictionary, any, CartRequestBody>,
    res: Response,
) => {
    try {
        const { cartItemId } = req.params;
        const userId = ensureAuthorization(req);

        const sql = `DELETE FROM cartItems
                WHERE id = ? AND user_id = ?`;
        const values = [cartItemId, userId];

        const [results] = await mariadb.query<ResultSetHeader>(sql, values);
        if (results.affectedRows) res.json(results);
        else res.status(httpStatusCode.NOT_FOUND).end();
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};
