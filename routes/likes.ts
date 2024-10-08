import express from "express";
import { addLike, cancleLike } from "../controller/LikeController.js";

const router = express.Router();

router.post("/:bookId", addLike); // 좋아요
router.delete("/:bookId", cancleLike); // 좋아요 취소

export default router;
