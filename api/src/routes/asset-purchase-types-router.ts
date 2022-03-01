import express, { Request, Response } from "express";

import { db } from "../data";

export const assetPurchaseTypesRouter = express.Router();

assetPurchaseTypesRouter.get("/", (req: Request, res: Response) => {
  return db("asset_purchase_type")
    .then((results) => {
      return res.json({ data: results });
    })
    .catch(({ message: errorDetails }) =>
      res.status(422).json({
        messages: [
          {
            variant: "error",
            text: "Failed to retrieve asset purchase types.",
            details: errorDetails,
          },
        ],
      })
    );
});
