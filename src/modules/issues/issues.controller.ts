import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
    const reporterId = req.user?.id;
    try {
        const result = await issuesService.createIssuesFromDB(req.body, reporterId)

        res.status(201).json({
            success: true,
            message: "Created Issue successfully!",
            data: result
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const issuesController = {
    createIssue,
}