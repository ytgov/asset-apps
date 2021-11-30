import express, { Request, Response } from "express";
import { body } from "express-validator";
import { ReturnValidationErrors } from "../middleware";
import _ from "lodash";

export const transferRouter = express.Router();
const PAGE_SIZE = 10;

import { db } from "../data";
import moment from "moment";

transferRouter.post("/", [body("page").isInt().default(1), body("itemsPerPage").isInt().default(10)],
    async (req: Request, res: Response) => {
        let { query, sortBy, sortDesc, page, itemsPerPage } = req.body;

        let skip = (page - 1) * itemsPerPage;
        let take = itemsPerPage;

        let list = await db("asset_transfer").orderBy("id").offset(skip).limit(take);
        let item_count = 0;

        let itemResults = await db("asset_transfer").count("*", { as: 'count' })

        if (itemResults) {
            item_count = itemResults[0].count as number;
        }

        for (let item of list) {
            item.transfer_date = moment(item.transfer_date).utc(false).format("YYYY-MM-DD")

            if (item.asset_item_id)
                item.asset = await db("asset_item").where({ id: item.asset_item_id }).first();

            if (item.from_owner_id)
                item.from_owner = await db("asset_owner").where({ id: item.from_owner_id }).first();

            if (item.to_owner_id)
                item.to_owner = await db("asset_owner").where({ id: item.to_owner_id }).first();
        }
        
        let page_count = Math.ceil(item_count / itemsPerPage);

        return res.json({ data: list, meta: { page, page_size: itemsPerPage, item_count, page_count } });
    });

transferRouter.delete("/:id",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });
