import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import httpStatusCode from "../utills/httpStatusCode.js";
import { Book, BookQuery } from "../model/Book.type.js";
import { ensureAuthorization } from "../utills/auth.js";
import jwt from "jsonwebtoken";

export const fetchAllBooks = async (req: Request<{}, {}, {}, BookQuery>, res: Response) => {
    try {
        let { category_id, news, limit, currentPage } = req.query;
        limit = +limit;
        currentPage = +currentPage;
        const values: BookQuery[keyof BookQuery][] = [];
        const isNewCondition = "pub_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
        let sql = `SELECT *,
                    (SELECT COUNT(*) FROM likes WHERE book_id = books.id) AS likes
                    FROM books`;
        let totalCount = 0;
        let where = "";
        if (category_id && news) {
            where = ` WHERE category_id = ? AND ${isNewCondition}`;
            values.push(category_id);
            totalCount = await getTotalBooks(where, category_id);
        } else if (category_id) {
            where = ` WHERE category_id = ?`;
            values.push(category_id);
            totalCount = await getTotalBooks(where, category_id);
        } else if (news) {
            where = ` WHERE ${isNewCondition}`;
            totalCount = await getTotalBooks(where);
        } else {
            totalCount = await getTotalBooks();
        }

        sql += `${where} LIMIT ?`;
        values.push(limit);

        if (currentPage) {
            const offset = limit * (currentPage - 1);
            sql += " OFFSET ?";
            values.push(offset);
        }
        const [results] = await mariadb.query<RowDataPacket[]>(sql, values);
        if (results.length) {
            const books = results as Book[];
            res.json({
                books: books.map((book) => {
                    book.pubDate = book.pub_date;
                    delete book.pub_date;
                    return book;
                }),
                pagination: {
                    totalBooks: totalCount,
                    currentPage: currentPage || 1,
                },
            });
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.BAD_REQUEST).json(error);
    }
};

const getTotalBooks = async (where: string = "", categoryId?: string | number) => {
    const sql = `SELECT COUNT(*) AS book_count FROM books ${where}`;
    if (categoryId) {
        const [results] = await mariadb.query<RowDataPacket[]>(sql, [categoryId]);
        return results[0].book_count;
    } else {
        const [results] = await mariadb.query<RowDataPacket[]>(sql);
        return results[0].book_count;
    }
};

export const fetchBook = async (req: Request, res: Response) => {
    try {
        const bookId = +req.params.bookId;
        let sql = "SELECT *,";
        // 로그인 상태면 liked 포함, 아니라면 미포함
        let userId;
        const values = [];
        userId = ensureAuthorization(req);
        if (!(userId instanceof Error)) {
            sql += " (EXISTS (SELECT * FROM likes WHERE book_id = ? AND user_id = ?)) AS liked,";
            values.push(bookId, userId);
        }

        sql += ` (SELECT COUNT(*) FROM likes WHERE book_id = books.id) AS likes 
                    FROM books 
                    LEFT JOIN categories
                    ON books.category_id = categories.category_id 
                    WHERE books.id = ?`;
        values.push(bookId);

        const [results] = await mariadb.query<RowDataPacket[]>(sql, values);

        const book = results[0] as Book;
        if (book) {
            book.categoryName = book.category_name;
            book.pubDate = book.pub_date;
            delete book.category_name;
            delete book.pub_date;
            res.json(book);
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            res.status(httpStatusCode.UNAUTHORIZED).json(error);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).json(error);
        }
    }
};

export const fetchBooksByKeyword = async (req: Request, res: Response) => {
    res.json("키워드별 도서 조회");
};
