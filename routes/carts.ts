import express from "express";

const router = express.Router();

// 장바구니 담기
router.post("/", (req, res) => {
    res.json("장바구니 담기");
});

// 장바구니 전체 조회
router.get("/", (req, res) => {
    res.json("장바구니 전체 조회");
});

// 장바구니에서 제거
router.delete("/:cartItemId", (req, res) => {
    res.json("장바구니에서 제거");
});

// 장바구니에서 선택한 상품 목록 조회 (주문 예상 상품 목록 조회)
router.get("/selected", (req, res) => {
    res.json("장바구니에서 선택한 상품 목록 조회");
});

export default router;
