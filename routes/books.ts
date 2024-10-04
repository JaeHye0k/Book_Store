import express from "express";
import { fetchAllBooks, fetchBook, fetchBooksByKeyword } from "../controller/BookController.js";

const router = express.Router();

// 전체 도서 조회
router.get("/", fetchAllBooks);

// 개별 도서 조회
router.get("/detail/:bookId", fetchBook);

// 키워드별 도서 조회
router.get("/search", fetchBooksByKeyword);

export default router;
