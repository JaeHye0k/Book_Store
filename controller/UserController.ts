import mariadb from "../mariadb.js";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { User } from "../model/User.type.js";
import httpStatusCode from "../utills/httpStatusCode.js";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const privateKey = process.env.PRIVATE_KEY;

export const join = async (req: Request, res: Response) => {
    try {
        const { email, password }: User = req.body;
        const sql = "INSERT INTO `users` (??) VALUES (?)";
        // 비밀번호 암호화
        const salt = crypto.randomBytes(64).toString("base64");
        const hashedPassword = crypto
            .pbkdf2Sync(password, salt, 10000, 10, "sha512")
            .toString("base64");
        // 암호화된 비밀번호와 salt 를 DB에 저장
        const cols = ["email", "password", "salt"];
        const values = [email, hashedPassword, salt];
        const [results] = await mariadb.query<ResultSetHeader>(sql, [cols, values]);

        res.status(httpStatusCode.CREATED).json(results);
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password }: User = req.body;

        const sql = "SELECT * FROM `users` WHERE `email` = ?";
        const [results] = await mariadb.query<RowDataPacket[]>(sql, email);
        const user = results[0] as User;

        const hashedPassword = crypto
            .pbkdf2Sync(password, user.salt, 10000, 10, "sha512")
            .toString("base64");

        if (user.password === hashedPassword) {
            // JWT 발행
            if (user) {
                const payload = { ...user };
                const options: SignOptions = {
                    expiresIn: "10m",
                    issuer: "JaeHyeok",
                };
                if (privateKey) {
                    const token = jwt.sign(payload, privateKey, options);
                    res.cookie("token", token, { httpOnly: true });
                    res.json(user);
                }
            } else {
                res.status(httpStatusCode.UNAUTHORIZED).json({
                    message: "아이디 또는 비밀번호를 확인해주세요",
                });
            }
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email }: User = req.body;
        const sql = "SELECT * FROM `users` WHERE `email`=?";
        const [results] = await mariadb.query<RowDataPacket[]>(sql, email);
        const user = results[0];
        if (user) {
            res.json({ email });
        } else {
            res.status(httpStatusCode.NOT_FOUND).end();
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const passwordReset = async (req: Request, res: Response) => {
    try {
        const { email, password }: User = req.body;
        const salt = crypto.randomBytes(64).toString("base64");
        const hashedPassword = crypto
            .pbkdf2Sync(password, salt, 10000, 10, "sha512")
            .toString("base64");

        const sql = "UPDATE `users` SET `password` = ?, `salt` = ? WHERE `email`= ?";
        const [results] = await mariadb.query<ResultSetHeader>(sql, [hashedPassword, salt, email]);

        if (results.affectedRows) {
            res.status(httpStatusCode.CREATED).json(results);
        } else {
            res.status(httpStatusCode.BAD_REQUEST).end();
        }
    } catch (e) {
        const error = e as Error;
        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json(error);
    }
};
