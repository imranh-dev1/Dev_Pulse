import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import { pool } from "../../db";

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

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const result = await issuesService.getAllIssuesFromDB(req.query);
        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await issuesService.getSingleIssueFromDB(id as string)

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const updateSingleIssue = async (req: Request, res: Response) => {

    const id = req.params.id as string;
    const updatedPayload = req.body;

    try {
        const result = await issuesService.updateSingleIssueFromDB(id, updatedPayload)

        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


export const issuesController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateSingleIssue
}