import express, { Request, Response } from "express";
import { body } from "express-validator";
import { ReturnValidationErrors } from "../middleware";
import { UserService } from "../services";
import _ from "lodash";
import { EnsureAuthenticated } from "./auth";

export const assetTagRouter = express.Router();

const db = new UserService();

assetTagRouter.post("/search",
    [body("keyword").notEmpty().isString()], ReturnValidationErrors,
    async (req: Request, res: Response) => {

        let data = [{ id: "Y1234", type: "tt" }, { id: "Y3223", type: "Desk" }];

        return res.json({ data });
    });

assetTagRouter.delete("/:id",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });
