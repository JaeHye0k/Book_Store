import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import httpStatusCode from "../utills/httpStatusCode.js";
import { Book, BookCategoryQuery } from "../model/Book.type.js";

export const fetchAllBooks = async (req: Request, res: Response) => {
    try {
        if (Object.keys(req.query).length) {
            fetchBooksByCategory(req, res);
        } else {
            const sql = "SELECT * FROM `books`";
            const [results] = await mariadb.query<RowDataPacket[]>(sql);
            const books = results as Book[];
            res.json(books);
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

export const fetchBook = async (req: Request, res: Response) => {
    try {
        const bookId = +req.params.bookId;
        const sql = "SELECT * FROM `books` WHERE id = ?";
        const [results] = await mariadb.query<RowDataPacket[]>(sql, bookId);
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

const fetchBooksByCategory = async (req: Request, res: Response) => {
    try {
        const { categoryId, newly }: BookCategoryQuery = req.query;
        let sql;
        let results;
        const newly_days = 30;
        if (newly) {
            sql =
                "SELECT * FROM `books` WHERE category_id = ? AND pub_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            [results] = await mariadb.query<RowDataPacket[]>(sql, [categoryId, newly_days]);
        } else {
            sql = "SELECT * FROM `books` WHERE category_id = ?";
            [results] = await mariadb.query<RowDataPacket[]>(sql, categoryId);
        }
        const books = results;
        if (books.length) {
            res.json(books);
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
