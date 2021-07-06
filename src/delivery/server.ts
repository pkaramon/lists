import express, { Request, Response } from "express";
import HttpRequest from "../httpControllers/HttpRequest";
import {
  setupAddListController,
  setupAddListItemController,
  setupAddUserController,
  setupViewList,
  setupDeleteListItemController,
  setupChangeListItemTitleController,
  setupLoginController,
} from "./controllers";

const app = express();

interface Controller {
  handle(req: HttpRequest<any>): Promise<any>;
}

function httpControllerToExpress(ctrl: Controller) {
  return (req: Request, res: Response) => {
    ctrl
      .handle({ body: req.body, headers: req.headers })
      .then((result) => {
        res.status(result.statusCode).json(result.data);
      })
      .catch(() => {
        res.status(500).json({ data: { error: "server error" } });
      });
  };
}

app.use(express.json());

app.post("/add-list", httpControllerToExpress(setupAddListController()));
app.post(
  "/add-list-item",
  httpControllerToExpress(setupAddListItemController())
);
app.post("/add-user", httpControllerToExpress(setupAddUserController()));
app.get("/view-list", httpControllerToExpress(setupViewList()));
app.post(
  "/delete-list-item",
  httpControllerToExpress(setupDeleteListItemController())
);
app.post(
  "/change-list-item-title",
  httpControllerToExpress(setupChangeListItemTitleController())
);
app.post("/login", httpControllerToExpress(setupLoginController()));

app.listen(3000, () => {
  console.log("server is running");
});
