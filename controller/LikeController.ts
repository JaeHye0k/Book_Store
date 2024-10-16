import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import httpStatusCode from "../utills/httpStatusCode.js";
import { LikeBody, LikeParams } from "../model/Like.type.js";
import { ensureAuthorization } from "../utills/getUserIdFromJWT.js";
import jwt from "jsonwebtoken";

export const addLike = async (req: Request<LikeParams, {}, LikeBody>, res: Response) => {
    try {
        const { bookId } = req.params;
        const userId = ensureAuthorization(req);

        const sql = "INSERT INTO `likes` (??) VALUES (?)";
        const values = [
            ["user_id", "book_id"],
            [userId, bookId],
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

export const cancleLike = async (req: Request<LikeParams, {}, LikeBody>, res: Response) => {
    try {
        const { bookId } = req.params;
        const userId = ensureAuthorization(req);

        const sql = "DELETE FROM `likes` WHERE ?? = ? AND ?? = ?";
        const values = ["user_id", userId, "book_id", bookId];
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
