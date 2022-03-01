import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { API_PORT, FRONTEND_URL } from "./config";
import { doHealthCheck } from "./utils/healthCheck";
import {
  assetOwnerRouter,
  assetPurchaseTypesRouter,
  assetTagRouter,
  v2Router,
  mailcodeRouter,
  scanRouter,
  transferRouter,
  userRouter,
} from "./routes";
import { CreateMigrationRoutes } from "./data";

//import { configureLocalAuthentication } from "./routes/auth-local";
import { configureAuthentication } from "./routes/auth";

//runMigrations();

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "block-all-mixed-content": [],
      "font-src": ["'self'", "https:", "data:"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": ["'self'", "'unsafe-eval'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
    },
  })
);

// very basic CORS setup
app.use(
  cors({
    origin: FRONTEND_URL,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

CreateMigrationRoutes(app);
configureAuthentication(app);

app.get("/api/healthCheck", (req: Request, res: Response) => {
  doHealthCheck(req, res);
});

app.use("/api/user", userRouter);
app.use("/api/asset-item", assetTagRouter);
app.use("/api/asset-owner", assetOwnerRouter);
app.use("/api/asset-purchase-types", assetPurchaseTypesRouter);
app.use("/api/asset-transfer", transferRouter);
app.use("/api/mailcode", mailcodeRouter);
app.use("/api/scan", scanRouter);
app.use("/api/v2/asset-item", v2Router.assetTagRouterRemote);

// serves the static files generated by the front-end
app.use(express.static(path.join(__dirname, "web")));

// if no other routes match, just send the front-end
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "web") + "/index.html");
});

const PORT: number = parseInt(API_PORT as string);

app.listen(PORT, async () => {
  console.log(`Asset App API listenting on port ${PORT}`);
});
