import type { Request, Response } from "express";
import { authService } from "./auth.service";

const signUpUsers = async (req: Request, res: Response) => {
    console.log(req.body)
    try {
        const result = await authService.signUpUsersFromDB(req.body)
        res.status(201).json({
            "success": true,
            "message": "User registered successfully",
            "data": result.rows[0]
        })

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

        res.status(200).json({
            success: true,
            message: "User signIn successfully...!",
            data: result,
        });

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