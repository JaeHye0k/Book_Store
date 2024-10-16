import jwt from "jsonwebtoken";

export interface User {
    id: number;
    email: string;
    password: string;
    salt: string;
}

export type UserPayload = jwt.JwtPayload & User;
