import { Knex } from "knex";
import _ from "lodash";
import moment from "moment";
import { QueryStatement, SortStatement } from ".";
import { mailcodeData } from "../data";

export class TransferService {

    readonly db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    async doSearch(query: Array<QueryStatement>, sort: Array<SortStatement>, page: number, page_size: number, skip: number, take: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let selectStmt = this.db("asset_transfer").select("asset_transfer.*")
                .leftJoin("asset_item", "asset_transfer.asset_item_id", "asset_item.id")
                .leftJoin("asset_category", "asset_transfer.asset_category_id", "asset_category.id");

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
                            let items = stmt.value.split(',');
                            selectStmt.whereIn(stmt.field, items);
                            break;
                        }
                        case "notin": {
                            let items = stmt.value.split(',');
                            selectStmt.whereNotIn(stmt.field, items);
                            break;
                        }
                        case "gt": {
                            selectStmt.where(stmt.field, '>', stmt.value);
                            break;
                        }
                        case "gte": {
                            selectStmt.where(stmt.field, '>=', stmt.value);
                            break;
                        }
                        case "lt": {
                            selectStmt.where(stmt.field, '<', stmt.value);
                            break;
                        }
                        case "lte": {
                            console.log(`Testing ${stmt.field} for IN on ${stmt.value}`)
                            selectStmt.where(stmt.field, '<=', stmt.value);
                            break;
                        }
                        case "contains": {
                            if (stmt.fields) {
                                let raws = [];
                                for (let field of stmt.fields) {
                                    raws.push(`LOWER(${field}) like '%${stmt.value.replace("'", "").toLowerCase()}%'`)
                                }
                                selectStmt.whereRaw(`(${raws.join(" OR ")})`);
                            }
                            else {
                                selectStmt.whereRaw(`LOWER(${stmt.field}) like '%${stmt.value.replace("'", "").toLowerCase()}%'`);
                            }

                            break;
                        }
                        default: {
                            console.log(`IGNORING ${stmt.field} on ${stmt.value}`)
                        }
                    }
                })
            }

            if (sort && sort.length > 0) {
                sort.forEach(stmt => {
                    selectStmt.orderBy(stmt.field, stmt.direction);
                })
            }
            else {
                selectStmt.orderBy("asset_transfer.request_date", "desc");
            }

            //console.log(selectStmt.toSQL().toNative())

            let fullData = await selectStmt;
            let uniqIds = _.uniq(fullData.map(i => i.id));
            let count = uniqIds.length;
            let page_count = Math.ceil(count / page_size);

            let data = await selectStmt.offset(skip).limit(take);

            let categories = await this.db("asset_category");

            for (let item of data) {
                item.transfer_date = moment(item.transfer_date).utc(true).format("YYYY-MM-DD");
                
                if (item.asset_category_id) {
                    let category = categories.filter(cat => cat.id == item.asset_category_id);

                    if (category.length > 0) {
                        if (item.description) {
                            item.asset_item = { tag: item.description };
                        }

                        item.description = `${category[0].description} (${item.quantity} items)`;
                    }
                }

                if (item.asset_item_id) {
                    item.asset_item = await this.db("asset_item").where({ id: item.asset_item_id }).first();
                    item.description = item.asset_item.description;
                }

                if (item.from_owner_id) {
                    item.from_owner = await this.db("asset_owner").where({ id: item.from_owner_id }).first();
                    if (item.from_owner_id == -1)
                        item.from_owner.display_name = 'Unknown : ' + item.from_owner_mailcode;
                    else
                        item.from_owner.display_name = `(${item.from_owner.mailcode}) ${item.from_owner.name}`;
                }

                if (item.to_owner_id) {
                    item.to_owner = await this.db("asset_owner").where({ id: item.to_owner_id }).first();

                    if (item.to_owner_id == -1)
                        item.to_owner.display_name = 'Unknown : ' + item.to_owner_mailcode;
                    else
                        item.to_owner.display_name = `(${item.to_owner.mailcode}) ${item.to_owner.name}`;
                }
            }

            let results = { data, meta: { page, page_size, item_count: count, page_count } };

            resolve(results);
        })
    }

    async clean() {
        let owners = await this.db("asset_owner").whereRaw("mailcode is not null");
        let transfers = await this.db("asset_transfer").whereRaw("from_owner_mailcode is not null OR to_owner_mailcode is not null");

        for (let o of owners) {
            let mcMatch = mailcodeData.filter((mc: any) => mc.department == o.department && mc.description == o.name);

            if (mcMatch.length == 1 && o.mailcode != mcMatch[0].mailcode) {
                await this.db("asset_owner").where({ id: o.id }).update({ mailcode: mcMatch[0].mailcode });
            }
        }

        for (let t of transfers) {
            let from = t.from_owner_mailcode;
            let to = t.to_owner_mailcode;

            let fOwn = owners.filter(o => o.mailcode == from);
            let tOwn = owners.filter(o => o.mailcode == to);
            let needSaved = false;
            let body = { from_owner_id: t.from_owner_id, to_owner_id: t.to_owner_id };

            if (fOwn.length > 0) {
                body.from_owner_id = fOwn[0].id;
                needSaved = true;
            }

            if (tOwn.length > 0) {
                body.to_owner_id = tOwn[0].id;
                needSaved = true;
            }

            if (needSaved) {
                //console.log("SAVING", t.id)
                await this.db("asset_transfer").where({ id: t.id }).update(body);
            }
        }
    }
}
