import type { Request, Response } from "express";

const createIssue = (req: Request, res: Response) => {
    try {
        console.log(req.body)

        res.status(200).json({
            success: true,
            message: "Created Issue successfully...!",
            // data: result,
        });



    } catch (error: any) {

        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}

export const issuesController = {
    createIssue,
}