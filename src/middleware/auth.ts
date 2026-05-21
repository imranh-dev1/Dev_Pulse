import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;

            // console.log(token)
            // console.log(req.user)

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized access"
                });
                return;
            }

            const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload;

            const usersData = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `, [decoded.email]
            )

            if (usersData.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "User not found..!"
                });
                return;
            }

            req.user = decoded;
            next();
        } catch (error) {
            next(error)
        }
    }

};

export default auth;

