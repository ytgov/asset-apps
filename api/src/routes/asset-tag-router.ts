import express, { Request, Response } from "express";
import { body } from "express-validator";
import { ReturnValidationErrors } from "../middleware";
import { AssetService, SortDirection, SortStatement } from "../services";
import _ from "lodash";

export const assetTagRouter = express.Router();
const PAGE_SIZE = 10;

import { db } from "../data";
const assetService = new AssetService(db);

assetTagRouter.post("/", [body("page").isInt().default(1), body("itemsPerPage").isInt().default(10)],
    async (req: Request, res: Response) => {
        let { query, sortBy, sortDesc, page, itemsPerPage } = req.body;
        let sort = new Array<SortStatement>();

        sortBy.forEach((s: string, i: number) => {
            sort.push({ field: s, direction: sortDesc[i] ? SortDirection.ASCENDING : SortDirection.DESCENDING })
        })

        let skip = (page - 1) * itemsPerPage;
        let take = itemsPerPage;

        let results = await assetService.doSearch(query, sort, page, itemsPerPage, skip, take);

        return res.json(results);
    });

assetTagRouter.post("/search",
    [body("keyword").notEmpty().isString()], ReturnValidationErrors,
    async (req: Request, res: Response) => {

        let data = [{ id: "Y1234", type: "tt", display_name: "Y1234 : Water pump - small" }, { id: "Y3223", type: "Desk", display_name: "Y3223 : Desk" }];

        return res.json({ data });
    });

assetTagRouter.delete("/:id",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });
