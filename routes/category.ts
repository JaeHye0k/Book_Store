import express from "express";
import { fetchAllCategories } from "../controller/CategoryController.js";

const router = express.Router();

// 카테고리 전체 조회
router.get("/", fetchAllCategories);

export default router;
