import express from "express";
import { addCartItem, fetchAllCartItems, removeCartItem } from "../controller/CartController.js";

const router = express.Router();

router.post("/", addCartItem); // 장바구니 담기
router.get("/", fetchAllCartItems); // 장바구니 전체 조회 / 선택한 상품 목록 조회
router.delete("/", removeCartItem); // 장바구니에서 제거

export default router;
