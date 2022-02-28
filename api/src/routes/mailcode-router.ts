import express, { Request, Response } from "express";
import { body } from "express-validator";
import { ReturnValidationErrors } from "../middleware";
import { mailcodeData } from "../data";

export const mailcodeRouter = express.Router();

mailcodeRouter.get("/", async (req: Request, res: Response) => {
  let list = mailcodeData.sort((a: any, b: any) => {
    return a.mailcode.localeCompare(b.mailcode);
  });
  list.map((r: any) => {
    return Object.assign(r, {
      display_name: `${r.mailcode} : ${r.description} (${r.department}) - ${r.location}`,
    });
  });

  return res.json({ data: list });
});

mailcodeRouter.post(
  "/search",
  [body("keyword").notEmpty().isString()],
  ReturnValidationErrors,
  async (req: Request, res: Response) => {
    let { keyword } = req.body;
    keyword = keyword.trim().toLowerCase();

    let results = new Array<any>();

    mailcodeData.forEach((mc: any) => {
      let dept = mc.department.toLowerCase();
      let mailcode = mc.mailcode.toLowerCase();
      let description = mc.description.toLowerCase();
      let location = mc.location.toLowerCase();

      if (mailcode == keyword)
        results.push(Object.assign(mc, { priority: -10 }));
      else if (dept == keyword)
        results.push(Object.assign(mc, { priority: -9 }));
      else if (description == keyword)
        results.push(Object.assign(mc, { priority: -8 }));
      else if (location == keyword)
        results.push(Object.assign(mc, { priority: -7 }));
      else if (dept.indexOf(keyword) >= 0)
        results.push(Object.assign(mc, { priority: dept.indexOf(keyword) }));
      else if (mailcode.indexOf(keyword) >= 0)
        results.push(
          Object.assign(mc, { priority: mailcode.indexOf(keyword) })
        );
      else if (description.indexOf(keyword) >= 0)
        results.push(
          Object.assign(mc, { priority: description.indexOf(keyword) })
        );
      else if (location.indexOf(keyword) >= 0)
        results.push(
          Object.assign(mc, { priority: location.indexOf(keyword) })
        );
    });

    results = results.sort((a, b) => {
      return a.priority - b.priority;
    });
    let cleaned = results.map((r) => {
      return {
        department: r.department,
        mailcode: r.mailcode,
        location: r.location,
        description: r.description,
        display_name: `${r.mailcode} : ${r.description} (${r.department}) - ${r.location}`,
      };
    });
    return res.json({ data: cleaned });
  }
);
