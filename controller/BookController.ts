import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import httpStatusCode from "../utills/httpStatusCode.js";
import { Book, BookQuery } from "../model/Book.type.js";

export const fetchAllBooks = async (req: Request<{}, {}, {}, BookQuery>, res: Response) => {
    try {
        let { category, isNew, limit, currentPage } = req.query;
        limit = +limit;
        currentPage = +currentPage;
        const isNewCondition = "pub_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)";
        const categoryIdCondition = "category_id = ?";
        const offset = limit * (currentPage - 1);
        const newInterval = 1;
        let sql = `SELECT *,
                    (SELECT COUNT(*) FROM likes WHERE book_id = books.id) AS likes
                    FROM books`;
        const values: BookQuery[keyof BookQuery][] = [];

        if (category && isNew) {
            sql += ` WHERE ${categoryIdCondition} AND ${isNewCondition}`;
            values.push(category, newInterval);
        } else if (category) {
            sql += ` WHERE ${categoryIdCondition}`;
            values.push(category);
        } else if (isNew) {
            sql += ` WHERE ${isNewCondition}`;
            values.push(newInterval);
        }
        sql += " LIMIT ? OFFSET ?";
        values.push(limit, offset);

        const [results] = await mariadb.query<RowDataPacket[]>(sql, values);
        const books = results as Book[];
        res.json(books);
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

export const fetchBook = async (req: Request, res: Response) => {
    try {
        const bookId = +req.params.bookId;
        const { userId } = req.body;
        const sql = `SELECT *, 
                        (EXISTS (SELECT * FROM likes WHERE book_id = ? AND user_id = ?)) AS liked,
                        (SELECT COUNT(*) FROM likes WHERE book_id = books.id) AS likes 
                    FROM books 
                    LEFT JOIN categories
                    ON books.category_id = categories.category_id 
                    WHERE books.id = ?`;
        const values = [bookId, userId, bookId];
        const [results] = await mariadb.query<RowDataPacket[]>(sql, values);

        const book = results[0] as Book;
        if (book) {
            res.json(book);
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

export const fetchBooksByKeyword = async (req: Request, res: Response) => {
    res.json("키워드별 도서 조회");
};
