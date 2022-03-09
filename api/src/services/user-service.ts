import { Knex } from "knex";
import _ from "lodash";

import { db } from "../data";

export class UserService {
    readonly db: Knex;

    constructor(db: Knex) {
        this.db = db;
    }

    async create(
        email: string,
        first_name: string,
        last_name: string,
        status: string,
        roles: string
    ): Promise<any> {
        let existing = await this.db("user")
            .where({ email })
            .count("email as cnt");

        if (existing[0].cnt > 0) return undefined;

        let user = {
            email,
            first_name,
            last_name,
            status,
            roles,
            create_date: new Date(),
        };

        return await this.db("user").insert(user);
    }

    async update(email: string, item: any) {
        return this.db("user").where({ email }).update(item);
    }

    async getAll() {
        return this.db("user");
    }

    async getByEmail(email: string): Promise<any | undefined> {
        return this.db("user")
            .where({ email })
            .first()
            .then((user) => {
                if (!user) return;

                return this.db
                    .select("id")
                    .from("asset_owner")
                    .where({ mailcode: user.mailcode })
                    .first()
                    .then((assetOwner) => {
                        user.mailcodeId = assetOwner.mailcodeId || -1;
                        return user;
                    });
            });
    }

    async getAccessFor(email: string): Promise<string[]> {
        return ["asdf"];
    }

    async setAccess(email: string, access: string[]) {
        return "";
    }

    async makeDTO(userRaw: any) {
        let dto = userRaw;
        dto.display_name = `${userRaw.first_name} ${userRaw.last_name}`;
        dto.roles = _.split(userRaw.roles, ",").filter(
            (r: string) => r.length > 0
        );
        dto.manage_mailcodes = _.split(userRaw.manage_mailcodes, ",").filter(
            (r: string) => r.length > 0
        );
        //dto.access = await this.db.getAccessFor(userRaw.email);
        //dto.display_access = _.join(dto.access.map((a: any) => a.level), ", ")

        return dto;
    }
}
