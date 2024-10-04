import express from "express";

const router = express.Router();

// 좋아요
router.post("/:bookId", (req, res) => {
    res.json("좋아요");
});

// 좋아요 취소
router.delete("/:bookId", (req, res) => {
    res.json("좋아요 취소");
});

export default router;
