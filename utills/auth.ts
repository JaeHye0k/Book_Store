import jwt from "jsonwebtoken";
import { UserPayload } from "../model/User.type";
import { Request } from "express";

export const ensureAuthorization = (req: Request) => {
    if (!req.headers.authorization)
        return new jwt.JsonWebTokenError("Authorization 헤더가 존재하지 않습니다.");
    if (!process.env.PRIVATE_KEY)
        return new ReferenceError("PRIVATE_KEY 환경 변수가 존재하지 않습니다.");
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const userPayload = decoded as UserPayload;
    return userPayload.id;
};
