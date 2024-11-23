import express from "express";
import { fetchAllBooks, fetchBook, fetchBooksByKeyword } from "../controller/BookController.js";

const router = express.Router();

router.get("/", fetchAllBooks); // 전체 도서 조회
router.get("/:bookId", fetchBook); // 개별 도서 조회
router.get("/search", fetchBooksByKeyword); // 키워드별 도서 조회

export default router;
