import { Knex } from "knex";

import { AssetTag } from "../data/models";

const ASSET_TAG_TABLE_NAME = "tblTestTagRepeat";

export class AssetTagService {
  readonly db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  create(assetTag: AssetTag) {
    this.db.insert(assetTag).into(ASSET_TAG_TABLE_NAME);
  }
}
