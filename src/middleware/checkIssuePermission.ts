import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const checkIssuePermission = () => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            const user = req.user;

            const issueId = req.params.id;

            // console.log(user, issueId)

            const issueResult = await pool.query(` SELECT * FROM issues WHERE id = $1`
                , [issueId]
            );

            if (issueResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Issue not found"
                });
            }

            const issue = issueResult.rows[0];

            if (user?.role === "maintainer") {
                return next();
            }

            if (user?.role === "contributor" && issue.reporter_id === user.id && issue.status === "open") {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "Forbidden access"
            });

        } catch (error) {
            next(error);
        };
    };
};

export default checkIssuePermission;

