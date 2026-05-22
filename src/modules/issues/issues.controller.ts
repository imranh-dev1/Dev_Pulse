import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req: Request, res: Response) => {
    const reporterId = req.user?.id;
    try {
        const result = await issuesService.createIssuesFromDB(req.body, reporterId)

        sendResponse(res, 201, true, "Issue created successfully!", result)

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

        sendResponse(res, 200, true, "All issues caught successfully!", result)
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

        sendResponse(res, 200, true, "Single issue caught successfully!", result)

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

        sendResponse(res, 200, true, "Issue updated successfully.!", result);

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const deletedSingleIssue = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const result = await issuesService.deletedSingleIssueFromBD(id)
        sendResponse(res, 200, true, "Issue deleted successfully.!", result)

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
    updateSingleIssue,
    deletedSingleIssue
}