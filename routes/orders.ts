import express from "express";
import { order, fetchAllOrders, fetchOrder } from "../controller/OrderController.js";

const router = express.Router();

router.post("/", order); // 주문 등록
router.get("/", fetchAllOrders); // 전체 주문 목록 조회
router.get("/:id", fetchOrder); // 주문 상품 상세 조회

export default router;
