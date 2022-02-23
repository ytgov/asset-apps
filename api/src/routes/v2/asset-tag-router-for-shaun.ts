import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import moment from "moment";

import { ReturnValidationErrors } from "../../middleware";
import { AssetService, SortDirection, SortStatement } from "../../services";
import { db, DB_TRUE } from "../../data";

export const assetTagRouterForShaun = express.Router();
const assetService = new AssetService(db);

assetTagRouterForShaun.post(
  "/",
  [body("page").isInt().default(1), body("itemsPerPage").isInt().default(10)],
  async (req: Request, res: Response) => {
    let { query, sortBy, sortDesc, page, itemsPerPage } = req.body;
    let sort = new Array<SortStatement>();

    sortBy.forEach((s: string, i: number) => {
      sort.push({
        field: s,
        direction: sortDesc[i]
          ? SortDirection.ASCENDING
          : SortDirection.DESCENDING,
      });
    });

    let skip = (page - 1) * itemsPerPage;
    let take = itemsPerPage;

    let results = await assetService.doSearch(
      query,
      sort,
      page,
      itemsPerPage,
      skip,
      take
    );

    return res.json(results);
  }
);

assetTagRouterForShaun.post(
  "/search",
  [body("keyword").notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { keyword } = req.body;

    let results = await assetService.doItemSearch(keyword);

    for (let row of results) {
      row.owner = await db("asset_owner")
        .where({ id: row.asset_owner_id })
        .first();

      if (row.purchase_date)
        row.purchase_date = moment(row.purchase_date)
          .utc(true)
          .format("YYYY-MM-DD");

      if (row.dept_tag) row.display = `${row.tag} (${row.dept_tag})`;
      else row.display = `${row.tag} : ${row.description}`;
    }

    return res.json({ data: results });
  }
);

assetTagRouterForShaun.get(
  "/asset-category",
  async (req: Request, res: Response) => {
    let list = await db("asset_category");

    return res.json({ data: list });
  }
);
