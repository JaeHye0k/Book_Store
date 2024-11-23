import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import httpStatusCode from "../utills/httpStatusCode.js";
import { LikeBody, LikeParams } from "../model/Like.type.js";
import { ensureAuthorization } from "../utills/auth.js";
import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2";

export const addLike = async (req: Request<LikeParams, {}, LikeBody>, res: Response) => {
    try {
        const { bookId } = req.params;
        const userId = ensureAuthorization(req);
        if (userId instanceof Error) throw userId;

        const sql = "INSERT INTO `likes` (??) VALUES (?)";
        const values = [
            ["user_id", "book_id"],
            [userId, bookId],
        ];
        const [result] = await mariadb.query<ResultSetHeader>(sql, values);
        if (result.affectedRows) res.json(result);
        else res.status(httpStatusCode.BAD_REQUEST).end();
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};

export const cancleLike = async (req: Request<LikeParams, {}, LikeBody>, res: Response) => {
    try {
        const { bookId } = req.params;
        const userId = ensureAuthorization(req);
        if (userId instanceof Error) throw userId;

        const sql = "DELETE FROM `likes` WHERE ?? = ? AND ?? = ?";
        const values = ["user_id", userId, "book_id", bookId];
        const [result] = await mariadb.query<ResultSetHeader>(sql, values);
        if (result.affectedRows) res.json(result);
        else res.status(httpStatusCode.BAD_REQUEST).end();
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error.message);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error.message);
        }
    }
};
