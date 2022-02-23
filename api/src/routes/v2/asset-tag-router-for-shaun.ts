import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import moment from "moment";

import { ReturnValidationErrors } from "../../middleware";
import { AssetService, SortDirection, SortStatement } from "../../services";
import { db, DB_TRUE } from "../../data";

export const assetTagRouterForShaun = express.Router();
const assetService = new AssetService(db);

assetTagRouterForShaun.get(
  "/",
  [param("page").toInt().default(1), param("pageSize").toInt().default(10)],
  async (
    req: Request & { params: { page: number; pageSize: number } },
    res: Response
  ) => {
    const { page, pageSize } = req.params;

    const itemCount = await db("asset_item")
      .count({ count: "*" })
      .first()
      .then(({ count = 0 } = {}) => {
        return Number(count);
      })
      .catch(() => 0);
    const pageCount = Math.ceil(itemCount / pageSize);
    const data = await db("asset_item")
      .orderBy("tag")
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    for (let row of data) {
      row.owner = await db("asset_owner")
        .where({ id: row.asset_owner_id })
        .first();

      if (row.purchase_date)
        row.purchase_date = moment(row.purchase_date)
          .utc(false)
          .format("YYYY-MM-DD");

      if (row.entry_date)
        row.entry_date = moment(row.entry_date).utc(false).format("YYYY-MM-DD");
    }

    return res.json({
      data,
      meta: { page, pageSize, itemCount, pageCount },
    });
  }
);

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
