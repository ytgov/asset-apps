import express, { Request, Response } from "express";
import { ReturnValidationErrors } from "../middleware";

export const scanRouter = express.Router();

scanRouter.get("/",
    async (req: Request, res: Response) => {
        return res.json({ data: [] });
    });

scanRouter.post("/",
    [], ReturnValidationErrors,
    async (req: Request, res: Response) => {
        return res.json({ data: null, messages: [{ variant: "success", text: "Scan saved" }] });
    });
