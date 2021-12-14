import express, { Request, Response } from "express";
import { body, param } from "express-validator";
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


assetTagRouter.put("/:id", [param("id").isInt().notEmpty()], ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { id } = req.params;

        let item = await db("asset_item").where({ id }).first();

        if (item) {
            let { tag, dept_tag, status, condition, asset_owner_id, un_commodity_code, make, model, comment } = req.body;
            let { serial, description, purchase_person, purchase_price, purchase_date, purchase_order_number, purchase_order_line } = req.body;

            let body = {
                tag,
                dept_tag,
                status,
                condition,
                asset_owner_id,
                un_commodity_code,
                make,
                model,
                serial,
                description,
                purchase_person,
                purchase_price,
                purchase_date,
                purchase_order_number,
                purchase_order_line,
                comment
            }

            await db("asset_item").where({ id }).update(body);
            return res.json({ messages: [{ variant: "success", text: "Asset saved" }] });
        }

        res.status(404).send();
    });

assetTagRouter.get("/asset-category",
    async (req: Request, res: Response) => {
        let list = await db("asset_category");

        return res.json({ data: list });
    });

assetTagRouter.delete("/:id",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });
