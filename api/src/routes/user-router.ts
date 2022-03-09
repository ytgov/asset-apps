import express, { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";

import { db } from "../data";
import { ReturnValidationErrors } from "../middleware";
import { UserService } from "../services";
import _ from "lodash";

export const userRouter = express.Router();

const userService = new UserService(db);

userRouter.get(
    "/me",
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUser = req.user;
        return userService
            .getByEmail(currentUser.email)
            .then((user) =>
                userService.makeDTO({
                    ...currentUser,
                    ...user,
                })
            )
            .then((userProfile) =>
                res.json({
                    data: userProfile,
                })
            )
            .catch(next);
    }
);

userRouter.get("/", async (req: Request, res: Response) => {
    let list = await userService.getAll();

    for (let user of list) {
        user = await userService.makeDTO(user);
    }

    return res.json({ data: list });
});

userRouter.put(
    "/:email",
    [param("email").notEmpty().isString()],
    ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { email } = req.params;
        let { roles, status, mailcode, manage_mailcodes } = req.body;

        let user = {
            roles: _.join(roles, ","),
            status,
            mailcode,
            manage_mailcodes: _.join(manage_mailcodes, ","),
        };

        await userService.update(email, user);

        return res.json({
            messages: [{ variant: "success", text: "User saved" }],
        });
    }
);

userRouter.put(
    "/:email/mailcode",
    [param("email").notEmpty().isString(), body("mailcode").notEmpty()],
    ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { email } = req.params;
        let { mailcode } = req.body;

        let user = await userService.getByEmail(email);

        if (user) {
            user.mailcode = mailcode;
            await userService.update(email, user);
            return res.json({
                messages: [{ variant: "success", text: "Mail code saved" }],
            });
        }

        res.status(404).send();
    }
);

userRouter.delete(
    "/:id",
    [param("id").notEmpty()],
    ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { id } = req.params;

        //await userService.disable(id);

        let list = await userService.getAll();

        return res.json({
            data: list,
            messages: [{ variant: "success", text: "Location removed" }],
        });
    }
);

userRouter.get(
    "/make-admin/:email/:key",
    async (req: Request, res: Response) => {
        let user = await userService.getByEmail(req.params.email);

        let { email, key } = req.params;

        if (key != process.env.SECRET) {
            return res.status(403).send("Your key is invalid");
        }

        if (user) {
            console.log(`KEY MATCHES, making ${email} an admin`);
            user.roles = ["Admin"];
            await userService.update(email, user);
        }

        res.send("Done");
    }
);
