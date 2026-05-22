import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const signUpUsers = async (req: Request, res: Response) => {
    try {
        const result = await authService.signUpUsersFromDB(req.body)

        sendResponse(res, 201, true, "User registered successfully", result.rows[0])

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    };
};

const signInUsers = async (req: Request, res: Response) => {

    try {
        const result = await authService.singInUsersFromDB(req.body);
        sendResponse(res, 200, true, "User signIn successfully...!", result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}

export const authController = {
    signUpUsers,
    signInUsers,
}