import express from "express";
import HttpController from "../httpControllers/HttpController";
import {
  setupAddListController,
  setupAddListItemController,
  setupAddUserController,
  setupViewListController,
  setupDeleteListItemController,
  setupChangeListItemTitleController,
  setupLoginController,
  setupChangeListDetailsController,
  setupDeleteUserController,
  setupDeleteListController,
} from "./controllers";

const app = express();

function httpControllerToExpress(ctrl: HttpController) {
  return (req: express.Request, res: express.Response) => {
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
app.get("/view-list", httpControllerToExpress(setupViewListController()));
app.post(
  "/delete-list-item",
  httpControllerToExpress(setupDeleteListItemController())
);
app.post(
  "/change-list-item-title",
  httpControllerToExpress(setupChangeListItemTitleController())
);
app.post("/login", httpControllerToExpress(setupLoginController()));
app.post(
  "/change-list-details",
  httpControllerToExpress(setupChangeListDetailsController())
);
app.post("/delete-user", httpControllerToExpress(setupDeleteUserController()));
app.post("/delete-list", httpControllerToExpress(setupDeleteListController()));

app.listen(3000, () => {
  console.log("server is running");
});
