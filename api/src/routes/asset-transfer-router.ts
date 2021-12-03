import express, { Request, Response } from "express";
import { body } from "express-validator";
import { SortDirection, SortStatement, TransferService } from "../services";
import { ReturnValidationErrors } from "../middleware";
import _ from "lodash";

export const transferRouter = express.Router();
const PAGE_SIZE = 10;

import { db } from "../data";
const transferService = new TransferService(db);

transferRouter.post("/", [body("page").isInt().default(1), body("itemsPerPage").isInt().default(10)],
    async (req: Request, res: Response) => {
        let { query, sortBy, sortDesc, page, itemsPerPage } = req.body;
        let sort = new Array<SortStatement>();

        sortBy.forEach((s: string, i: number) => {
            sort.push({ field: s, direction: sortDesc[i] ? SortDirection.ASCENDING : SortDirection.DESCENDING })
        })

        let skip = (page - 1) * itemsPerPage;
        let take = itemsPerPage;

        let results = await transferService.doSearch(query, sort, page, itemsPerPage, skip, take);

        return res.json(results);
    });

transferRouter.delete("/:id",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });

transferRouter.get("/clean",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        await transferService.clean();

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });
