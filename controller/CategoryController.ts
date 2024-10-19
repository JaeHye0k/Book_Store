import { RowDataPacket } from "mysql2";
import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import httpStatusCode from "../utills/httpStatusCode.js";

export const fetchAllCategories = async (req: Request, res: Response) => {
    try {
        const sql = "SELECT * FROM `categories` ORDER BY `category_id` ASC";
        const [results] = await mariadb.query<RowDataPacket[]>(sql);
        if (results.length) {
            results.forEach((result) => {
                result.categoryId = result.category_id;
                result.categoryName = result.category_name;
                delete result.category_id;
                delete result.category_name;
            });
            res.json(results);
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json(error);
    }
};
