import { Knex } from "knex";

import { MAXIMUM_DATE } from "../data";
import { AssetItem, AssetTagPrinter } from "../data/models";

const ASSET_TAG_PRINTER_TABLE_NAME = "tblTestTagRepeat";

export class AssetTagPrinterService {
  readonly db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  create(
    assetTagPrinter: AssetTagPrinter
  ): Promise<AssetTagPrinter & { id: number }> {
    return this.db
      .insert(assetTagPrinter, ["id", ...Object.keys(assetTagPrinter)])
      .into(ASSET_TAG_PRINTER_TABLE_NAME)
      .then((result) => result[0]);
  }

  async createFromAssetItem(assetItem: AssetItem & { id: number }) {
    const {
      id,
      asset_owner_id,
      asset_type_id,
      purchase_date,
      purchase_order_number,
      purchase_person,
      purchase_type_id,
      tag,
      description
    } = assetItem;

    const { mailcode, department } = await this.db
      .select("mailcode", "department")
      .from("asset_owner")
      .where({ id: asset_owner_id })
      .first();

   /*  const { description } = await this.db
      .select("description")
      .from("asset_type")
      .where({ id: asset_type_id })
      .first()
      .then((result) => result || { description: "Unknown" }); */

    const { description: purchase_type } = await this.db
      .select("description")
      .from("asset_purchase_type")
      .where({ id: purchase_type_id })
      .first();

    return this.create({
      DateTagRequestSubmitted: purchase_date,
      DescriptionOfItem: description,
      EmailOfRequestor: purchase_person,
      EndTime: MAXIMUM_DATE,
      Mailcode: mailcode,
      PurchaseType: purchase_type,
      StartTime: new Date(),
      TagRequestID: id,
      YTG_NUMBER: tag,
      Department: department
    });
  }
}
