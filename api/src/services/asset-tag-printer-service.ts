import { Knex } from "knex";

import { AssetTagPrinter } from "../data/models";

const ASSET_TAG_PRINTER_TABLE_NAME = "tblTestTagRepeat";

export class AssetTagPrinterService {
  readonly db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  create(assetTagPrinter: AssetTagPrinter) {
    return this.db
      .insert(assetTagPrinter, ["id", ...Object.keys(assetTagPrinter)])
      .into(ASSET_TAG_PRINTER_TABLE_NAME)
      .then((result) => result[0]);
  }
}
