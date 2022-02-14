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

transferRouter.post("/transfer",
    async (req: Request, res: Response) => {
        let { from_owner_id, to_owner_id, rows, action } = req.body;

        for (let row of rows) {
            let transfer = {
                asset_category_id: row.type,
                request_user: req.user.email,
                request_date: new Date(),
                transfer_date: new Date(),
                condition: row.condition,
                from_owner_id,
                to_owner_id,
                quantity: row.quantity,
                description: row.tag
            }

            await db("asset_transfer").insert(transfer);
        }

        return res.json({ messages: { variant: "success", text: "Transfer saved" } });
    });


transferRouter.post("/transfer-request",
    async (req: Request, res: Response) => {
        let { asset, mailcode, rows, condition } = req.body;

        if (asset) {
            let transfer = {
                asset_item_id: asset.id,
                request_user: req.user.email,
                request_date: new Date(),
                transfer_date: new Date(),
                condition: `REQUEST: ${condition}`,
                from_owner_id: mailcode,
                to_owner_id: 80,
                quantity: 1
            };

            await db("asset_transfer").insert(transfer);
        }
        else {
            for (let row of rows) {
                let transfer = {
                    asset_category_id: row.type,
                    request_user: req.user.email,
                    request_date: new Date(),
                    transfer_date: new Date(),
                    condition: `REQUEST: ${row.condition}`,
                    from_owner_id: mailcode,
                    to_owner_id: 80,
                    quantity: row.quantity
                };

                await db("asset_transfer").insert(transfer);
            }
        }

        return res.json({ messages: { variant: "success", text: "Transfer saved" } });
    });


transferRouter.delete("/:id", async (req: Request, res: Response) => {
    let { id } = req.params;

    await db("asset_transfer").where({ id }).delete();
    return res.json({
        data: {},
        messages: [{ variant: "success", text: "Transfer removed" }],
    });
});

transferRouter.get("/clean",
    async (req: Request, res: Response) => {
        let { id } = req.params;

        await transferService.clean();

        return res.json({ data: {}, messages: [{ variant: "success", text: "Location removed" }] });
    });
