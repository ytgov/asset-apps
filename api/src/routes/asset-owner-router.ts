import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { ReturnValidationErrors } from "../middleware";
import _ from "lodash";

export const assetOwnerRouter = express.Router();

import { db } from "../data";

assetOwnerRouter.get("/",
    async (req: Request, res: Response) => {
        let list = await db("asset_owner");
        return res.json({ data: list });
    });

assetOwnerRouter.put("/:id",
    [param("id").notEmpty().isInt(),
    body("mailcode").notEmpty(), body("name").notEmpty(), body("department").notEmpty()],
    ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { id } = req.params;
        let { mailcode, name, department, division, branch } = req.body;

        mailcode = cleanAndDefault(mailcode, 'Unknown');
        name = cleanAndDefault(name, 'Unknown');
        department = cleanAndDefault(department, 'Unknown');
        division = cleanAndDefault(division, 'Unknown');
        branch = cleanAndDefault(branch, 'Unknown');

        let body = {
            name, mailcode, department, division, branch
        }

        let list = await db("asset_owner").where({ id }).update(body);

        return res.json({ data: list, messages: [{ text: "Owner saved", variant: "success" }] });
    });

assetOwnerRouter.post("/",
    [body("mailcode").notEmpty(), body("name").notEmpty(), body("department").notEmpty()],
    ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { id } = req.params;
        let { mailcode, name, department, division, branch } = req.body;

        mailcode = cleanAndDefault(mailcode, 'Unknown');
        name = cleanAndDefault(name, 'Unknown');
        department = cleanAndDefault(department, 'Unknown');
        division = cleanAndDefault(division, 'Unknown');
        branch = cleanAndDefault(branch, 'Unknown');

        let body = {
            name, mailcode, department, division, branch
        }

        let list = await db("asset_owner").insert(body);

        return res.json({ data: list, messages: [{ text: "Owner saved", variant: "success" }] });
    });

assetOwnerRouter.delete("/:id",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        let ownedAssets = await db("asset_item").where({ asset_owner_id: id });

        if (ownedAssets.length == 0) {
            await db("asset_owner").where({ id }).delete();
            return res.json({ data: {}, messages: [{ variant: "success", text: "Owner removed" }] });
        }
        else {
            return res.json({ data: {}, messages: [{ variant: "error", text: "Owner has assets assigned, remove denied" }] });
        }
    });

function cleanAndDefault(input: string, defaultVal: string = 'Unknown'): string {
    input = (input || "").trim();

    if (input.length == 0)
        return defaultVal;

    return input;
}
