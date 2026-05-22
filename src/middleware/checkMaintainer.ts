import type { NextFunction, Request, Response } from "express";

const checkMaintainer = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (user?.role !== "maintainer") {
            return res.status(403).json({
                success: false,
                message: "Forbidden access"
            });
        }

        next();
    };
};

export default checkMaintainer;