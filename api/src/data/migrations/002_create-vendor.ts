import * as knex from "knex";

exports.up = function (knex: knex.Knex, Promise: any) {
    return knex.schema.createTable("vendor", function (t) {
        t.string("vendor_id", 20).primary();
        t.string("name", 100).notNullable();
        t.string("vendor_community", 100).nullable();
        t.string("vendor_sector", 120).nullable();
        t.string("vendor_subsector", 240).nullable();
    });
};

exports.down = function (knex: knex.Knex, Promise: any) {
    return knex.schema.dropTable("vendor");
};
