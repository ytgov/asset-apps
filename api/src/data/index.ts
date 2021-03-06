import * as knex from "knex";
import { DB_CONFIG } from "../config";

export * from "./migrator";

export const db = knex.knex(DB_CONFIG);
export const DB_TRUE = 1;
export const DB_FALSE = 0;
export const MAXIMUM_DATE = new Date("2099-12-31 23:59:59");
export const APPLICATION_USER = {
  email: "assets@yukon.ca",
  first_name: "Asset",
  last_name: "Management",
};
