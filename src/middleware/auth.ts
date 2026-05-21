import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

export const auth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized access"
        });

        return;
    }

    const decoded = jwt.verify(token, config.jwt_secret);

    req.user = decoded;

    next();
};