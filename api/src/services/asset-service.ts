import { Knex } from "knex";
import _ from "lodash";
import moment from "moment";

import { QueryStatement, SortStatement } from ".";
import { AssetItem } from "../data/models";

export class AssetService {
    readonly db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    create(assetItem: AssetItem) {
        return this.db.transaction(async (trx) => {
            const next_y_number_result = await trx.raw(
                "SELECT NEXT VALUE FOR dbo.y_numbers as y_number"
            );
            const next_y_number = next_y_number_result[0]["y_number"];

            return trx
                .insert(
                    {
                        ...assetItem,
                        tag: `Y${next_y_number}`,
                    },
                    [...Object.keys(assetItem), "tag"]
                )
                .into("asset_item");
        });
    }

    async doSearch(
        query: Array<QueryStatement>,
        sort: Array<SortStatement>,
        page: number,
        page_size: number,
        skip: number,
        take: number
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let selectStmt = this.db("asset_item");

            if (query && query.length > 0) {
                query.forEach((stmt: any) => {
                    switch (stmt.operator) {
                        case "eq": {
                            let p = {};
                            let m = `{"${stmt.field}": "${stmt.value}"}`;
                            Object.assign(p, JSON.parse(m));
                            selectStmt.where(p);
                            break;
                        }
                        case "in": {
                            let items = stmt.value.split(",");
                            selectStmt.whereIn(stmt.field, items);
                            break;
                        }
                        case "notin": {
                            let items = stmt.value.split(",");
                            selectStmt.whereNotIn(stmt.field, items);
                            break;
                        }
                        case "gt": {
                            selectStmt.where(stmt.field, ">", stmt.value);
                            break;
                        }
                        case "gte": {
                            selectStmt.where(stmt.field, ">=", stmt.value);
                            break;
                        }
                        case "lt": {
                            selectStmt.where(stmt.field, "<", stmt.value);
                            break;
                        }
                        case "lte": {
                            console.log(
                                `Testing ${stmt.field} for IN on ${stmt.value}`
                            );
                            selectStmt.where(stmt.field, "<=", stmt.value);
                            break;
                        }
                        case "contains": {
                            if (stmt.fields) {
                                let raws = [];
                                for (let field of stmt.fields) {
                                    raws.push(
                                        `LOWER(${field}) like '%${stmt.value
                                            .replace("'", "")
                                            .toLowerCase()}%'`
                                    );
                                }
                                selectStmt.whereRaw(`(${raws.join(" OR ")})`);
                            } else {
                                selectStmt.whereRaw(
                                    `LOWER(${stmt.field}) like '%${stmt.value
                                        .replace("'", "")
                                        .toLowerCase()}%'`
                                );
                            }

                            break;
                        }
                        default: {
                            console.log(
                                `IGNORING ${stmt.field} on ${stmt.value}`
                            );
                        }
                    }
                });
            }

            if (sort && sort.length > 0) {
                sort.forEach((stmt) => {
                    selectStmt.orderBy(stmt.field, stmt.direction);
                });
            } else {
                selectStmt.orderBy("tag");
            }

            //console.log(selectStmt.toSQL().toNative())

            let fullData = await selectStmt;
            let uniqIds = _.uniq(fullData.map((i) => i.id));
            let count = uniqIds.length;
            let page_count = Math.ceil(count / page_size);

            let data = await selectStmt.offset(skip).limit(take);

            for (let row of data) {
                row.owner = await this.db("asset_owner")
                    .where({ id: row.asset_owner_id })
                    .first();

                if (row.purchase_date)
                    row.purchase_date = moment(row.purchase_date)
                        .utc(false)
                        .format("YYYY-MM-DD");

                if (row.entry_date)
                    row.entry_date = moment(row.entry_date)
                        .utc(false)
                        .format("YYYY-MM-DD");
            }

            let results = {
                data,
                meta: { page, page_size, item_count: count, page_count },
            };

            resolve(results);
        });
    }

    async doItemSearch(keyword: string): Promise<any[]> {
        return this.db("asset_item")
            .where({ status: "Active" })
            .whereRaw(`LOWER(tag) like ? OR LOWER(dept_tag) like ?`, [
                `%${keyword.toLowerCase().trim()}%`,
                `%${keyword.toLowerCase().trim()}%`,
            ])
            .orderBy("tag")
            .limit(50);
    }
}
