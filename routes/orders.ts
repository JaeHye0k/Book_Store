import express from "express";

const router = express.Router();

// 주문 등록
router.post("/", (req, res) => {
    res.json("주문 등록");
});

// 전체 주문 목록 조회
router.get("/", (req, res) => {
    res.json("전체 주문 목록 조회");
});

// 주문 상품 상세 조회
router.get("/:orderId", (req, res) => {
    res.json("주문 상품 상세 조회");
});

export default router;
