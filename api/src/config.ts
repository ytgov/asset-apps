import * as dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV || "development";

let path;
switch (process.env.NODE_ENV) {
	case "test":
		path = `.env.test`;
		break;
	case "production":
		path = `.env.production`;
		break;
	default:
		path = `.env.development`;
}
dotenv.config({ path: path });

console.log(`LOADING ${NODE_ENV} CONFIG FROM ${path}`);

export const API_PORT = process.env.API_PORT || "3000";
export const FRONTEND_URL = process.env.FRONTEND_URL || "";
export const AUTH_REDIRECT = process.env.AUTH_REDIRECT || "";

export const DB_USER = process.env.DB_USER || "sa";
export const DB_PASS = process.env.DB_PASS || "Testing1122";
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = parseInt(process.env.DB_PORT || "") || 1433;
export const DB_NAME = process.env.DB_NAME || "AssetControl";
export const DB_CLIENT = process.env.DB_CLIENT || "mssql";

export const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY || "";

export const DB_CONFIG = {
	client: DB_CLIENT,
	connection: {
		server: DB_HOST,
		user: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		port: DB_PORT,
	},
};

export const MAIL_FROM = process.env.MAIL_FROM || "assets@yukon.ca";
export const MAIL_HOST = process.env.MAIL_HOST || "smtp.gov.yk.ca";
export const MAIL_PORT = process.env.MAIL_PORT || 25;
export const MAIL_USER = process.env.MAIL_USER || "";
export const MAIL_PASS = process.env.MAIL_PASS || "";

export const APPLICATION_NAME = "Asset Managment";

let mail_config = {};
if (process.env.NODE_ENV === "production")
	mail_config = {
		host: MAIL_HOST,
		port: MAIL_PORT,
		secure: false, // true for 465, false for other ports
	};
else {
	mail_config = {
		host: MAIL_HOST,
		port: MAIL_PORT,
		secure: false, // true for 465, false for other ports
		auth: {
			user: MAIL_USER,
			pass: MAIL_PASS,
		},
	};
}

export const MAIL_CONFIG = mail_config;

// API access for Shaun
export const V2_API_KEY_REMOTE = process.env.V2_API_KEY_REMOTE || "";
