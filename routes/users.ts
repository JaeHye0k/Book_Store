import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { join, login, requestPasswordReset, passwordReset } from "../controller/UserController.js";
import httpStatusCode from "../utills/httpStatusCode.js";

const router = express.Router();

function checkValidation(req: Request, res: Response, next: NextFunction) {
    const err = validationResult(req);
    if (err.isEmpty()) next();
    else res.status(httpStatusCode.BAD_REQUEST).json(err.array());
}

// 회원가입
router.post(
    "/join",
    body("email").isEmail().withMessage("이메일 형식에 맞춰주세요"),
    body("password").notEmpty().isString().withMessage("비밀번호를 입력해주세요"),
    checkValidation,
    join,
);
router.post("/login", login); // 로그인
router.post("/reset", requestPasswordReset); // 비밀번호 초기화 요청
router.put("/reset", passwordReset); // 비밀번호 초기화

export default router;
