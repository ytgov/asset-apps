import express, { Request, Response } from "express";
import { ReturnValidationErrors } from "../middleware";

export const scanRouter = express.Router();

import { db } from "../data";
import moment from "moment";
import { param } from "express-validator";

scanRouter.get("/", async (req: Request, res: Response) => {
  let list = await db("asset_scan")
    .where({ scan_user: req.user.email })
    .orderBy("scan_date", "desc");

  for (let item of list) {
    item.scan_date = moment(item.scan_date)
      .utc(true)
      .format("YYYY-MM-DD @ h:mm a");
    item.description = item.scan_value;

    if (item.scan_value && item.scan_value.startsWith("Y")) {
      item.asset = await db("asset_item")
        .where({ tag: item.scan_value })
        .first();

      if (item.asset) {
        item.description = `${item.scan_value} : ${item.asset.description}`;

        if (item.asset.make) item.description += " - " + item.asset.make;

        if (item.asset.model) item.description += " " + item.asset.model;
      }
    }
  }

  return res.json({ data: list });
});

scanRouter.post(
  "/",
  [],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { value } = req.body;

    let scan = {
      scan_user: req.user.email,
      scan_date: new Date(),
      scan_value: value,
    };

    await db("asset_scan").insert(scan);

    return res.json({ messages: [{ variant: "success", text: "Scan saved" }] });
  }
);

scanRouter.delete(
  "/:id",
  [param("id").notEmpty().isInt()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { id } = req.params;

    await db("asset_scan").where({ id }).delete();

    return res.json({
      messages: [{ variant: "success", text: "Scan deleted" }],
    });
  }
);
