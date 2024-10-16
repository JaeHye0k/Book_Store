import jwt from "jsonwebtoken";
import { UserPayload } from "../model/User.type";
import { Request } from "express";

export const ensureAuthorization = (req: Request) => {
    try {
        if (!req.headers.authorization)
            throw new ReferenceError("Authorization 헤더가 존재하지 않습니다.");
        if (!process.env.PRIVATE_KEY)
            throw new ReferenceError("PRIVATE_KEY 환경 변수가 존재하지 않습니다.");

        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        const userPayload = decoded as UserPayload;
        return userPayload.id;
    } catch (e) {
        const error = e as Error;
        if (error instanceof jwt.TokenExpiredError) {
            error.message = "로그인(인증) 세션이 만료되었습니다. 다시 로그인 하세요.";
        } else if (error instanceof jwt.JsonWebTokenError) {
            error.message = "유효하지 않은 토큰입니다.";
        }
        console.error(error);
        throw error;
    }
};
