import express, { Request, Response } from "express";
import { ReturnValidationErrors } from "../middleware";

export const scanRouter = express.Router();

import { db } from "../data";

scanRouter.get("/",
    async (req: Request, res: Response) => {
        let list = await db("asset_scan").where({ scan_user: req.user.email }).orderBy("scan_date", "desc");
        return res.json({ data: list });
    });

scanRouter.post("/", [], ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { value } = req.body;

        let scan = { scan_user: req.user.email, scan_date: new Date(), scan_value: value };

        await db("asset_scan").insert(scan);

        return res.json({ messages: [{ variant: "success", text: "Scan saved" }] });
    });
