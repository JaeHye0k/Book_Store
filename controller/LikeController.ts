import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import httpStatusCode from "../utills/httpStatusCode.js";
import { LikeBody, LikeParams } from "../model/Like.type.js";

export const addLike = async (req: Request<LikeParams, {}, LikeBody>, res: Response) => {
    try {
        const { bookId } = req.params;
        const { userId } = req.body;
        const sql = "INSERT INTO `likes` (??) VALUES (?)";
        const values = [
            ["user_id", "book_id"],
            [userId, bookId],
        ];
        const [results] = await mariadb.query(sql, values);
        res.json(results);
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

export const cancleLike = async (req: Request<LikeParams, {}, LikeBody>, res: Response) => {
    try {
        const { bookId } = req.params;
        const { userId } = req.body;
        const sql = "DELETE FROM `likes` WHERE ?? = ? AND ?? = ?";
        const values = ["user_id", userId, "book_id", bookId];
        const [results] = await mariadb.query(sql, values);
        res.json(results);
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};
