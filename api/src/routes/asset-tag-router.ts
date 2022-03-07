import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import moment from "moment";
import _ from "lodash";

import { ReturnValidationErrors } from "../middleware";
import {
  AssetService,
  AssetTagPrinterService,
  SortDirection,
  SortStatement,
} from "../services";
import { db, DB_TRUE, MAXIMUM_DATE } from "../data";

export const assetTagRouter = express.Router();
const assetService = new AssetService(db);
const assetTagPrinterService = new AssetTagPrinterService(db);

assetTagRouter.post("/", (req: Request, res: Response) => {
  const { assetItem } = req.body;

  return assetService
    .create({
      ...assetItem,
      status: "Active",
      condition: "Good",
    })
    .then(async (assetItemResult) => {
      const {
        id,
        asset_owner_id,
        asset_type_id,
        purchase_date,
        purchase_order_number,
        purchase_person,
        purchase_type_id,
        tag,
      } = assetItemResult;

      const { mailcode } = await db
        .select("mailcode")
        .from("asset_owner")
        .where({ id: asset_owner_id })
        .first();

      const { description } = await db
        .select("description")
        .from("asset_type")
        .where({ id: asset_type_id })
        .first()
        .then((result) => result || { description: "Unknown" });

      const { description: purchase_type } = await db
        .select("description")
        .from("asset_purchase_type")
        .where({ id: purchase_type_id })
        .first();

      const assetTagPrinter = await assetTagPrinterService.create({
        DateTagRequestSubmitted: purchase_date,
        DescriptionOfItem: description,
        EmailOfRequestor: purchase_person,
        EndTime: MAXIMUM_DATE,
        Mailcode: mailcode,
        PurchaseType: purchase_type,
        StartTime: new Date(),
        TagRequestID: id,
        YTG_NUMBER: tag,
      });

      return { assetItem: assetItemResult, assetTagPrinter };
    })
    .then((result) => {
      return res.status(201).json({
        data: result,
        messages: [{ variant: "success", text: "Asset created" }],
      });
    })
    .catch(({ message: errorDetails }) =>
      res.status(422).json({
        messages: [
          {
            variant: "error",
            text: "Asset failed to save",
            details: errorDetails,
          },
        ],
      })
    );
});

assetTagRouter.post(
  "/query",
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

assetTagRouter.post(
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

assetTagRouter.put(
  "/:id",
  [param("id").isInt().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { id } = req.params;

    let item = await db("asset_item").where({ id }).first();
    const default_owner = await db("asset_owner")
      .where({ default_owner: DB_TRUE })
      .first();

    if (item) {
      let {
        tag,
        dept_tag,
        status,
        condition,
        asset_owner_id,
        un_commodity_code,
        make,
        model,
        comment,
      } = req.body;
      let {
        serial,
        description,
        purchase_person,
        purchase_price,
        purchase_date,
        purchase_order_number,
        purchase_order_line,
      } = req.body;

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
        comment,
      };

      if (item.asset_owner_id != asset_owner_id) {
        // do a transfer to the new owner
        console.log(
          "Generating a transfer from " +
            item.asset_owner_id +
            " to " +
            asset_owner_id
        );

        if (asset_owner_id == default_owner.id) {
          // this is an inbound transfer
          let transfer = {
            asset_item_id: id,
            request_user: req.user.email,
            request_date: new Date(),
            transfer_date: new Date(),
            condition: status,
            from_owner_id: item.asset_owner_id,
            to_owner_id: asset_owner_id,
            quantity: 1,
          };

          await db("asset_transfer").insert(transfer);
        } else {
          let now = moment();
          //this is inbound and outbound
          let transfer1 = {
            asset_item_id: id,
            request_user: req.user.email,
            request_date: now.toDate(),
            transfer_date: now.toDate(),
            condition: status,
            from_owner_id: item.asset_owner_id,
            to_owner_id: default_owner.id,
            quantity: 1,
          };
          await db("asset_transfer").insert(transfer1);

          now = now.add(1, "second");

          let transfer2 = {
            asset_item_id: id,
            request_user: req.user.email,
            request_date: now.toDate(),
            transfer_date: now.toDate(),
            condition: status,
            from_owner_id: default_owner.id,
            to_owner_id: asset_owner_id,
            quantity: 1,
          };
          await db("asset_transfer").insert(transfer2);
        }
      }

      await db("asset_item").where({ id }).update(body);
      return res.json({
        messages: [{ variant: "success", text: "Asset saved" }],
      });
    }

    res.status(404).send();
  }
);

assetTagRouter.put(
  "/:id/limited",
  [param("id").isInt().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { id } = req.params;

    let item = await db("asset_item").where({ id }).first();

    if (item) {
      let {
        dept_tag,
        status,
        condition,
        un_commodity_code,
        make,
        model,
        comment,
      } = req.body;
      let {
        serial,
        description,
        purchase_person,
        purchase_price,
        purchase_date,
        purchase_order_number,
        purchase_order_line,
      } = req.body;

      let body = {
        dept_tag,
        status,
        condition,
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
        comment,
      };

      await db("asset_item").where({ id }).update(body);
      return res.json({
        messages: [{ variant: "success", text: "Asset saved" }],
      });
    }

    res.status(404).send();
  }
);

assetTagRouter.put(
  "/:id/limited/transfer",
  [param("id").isInt().notEmpty()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { id } = req.params;

    let item = await db("asset_item").where({ id }).first();
    const default_owner = await db("asset_owner")
      .where({ default_owner: DB_TRUE })
      .first();

    if (item) {
      let {
        dept_tag,
        status,
        condition,
        asset_owner_id,
        un_commodity_code,
        make,
        model,
        comment,
      } = req.body;
      let {
        serial,
        description,
        purchase_person,
        purchase_price,
        purchase_date,
        purchase_order_number,
        purchase_order_line,
      } = req.body;

      let body = {
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
        comment,
      };

      await db("asset_item").where({ id }).update(body);

      let transfer = {
        asset_item_id: id,
        request_user: req.user.email,
        request_date: new Date(),
        transfer_date: new Date(),
        condition: `REQUEST: ${condition}`,
        from_owner_id: asset_owner_id,
        to_owner_id: default_owner.id,
        quantity: 1,
      };

      await db("asset_transfer").insert(transfer);

      return res.json({
        messages: [{ variant: "success", text: "Asset saved" }],
      });
    }

    res.status(404).send();
  }
);

assetTagRouter.get("/asset-category", async (req: Request, res: Response) => {
  let list = await db("asset_category");

  return res.json({ data: list });
});

assetTagRouter.delete("/:id", async (req: Request, res: Response) => {
  let { id } = req.params;

  return res.json({
    data: {},
    messages: [{ variant: "success", text: "Location removed" }],
  });
});
