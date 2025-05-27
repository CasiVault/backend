import { Router } from "express";
import { UserRequestsController } from "../controllers/UserRequestsController";

export class UserRequestsRoute {
    public router: Router;
    private withdrawRequestController = new UserRequestsController();

    constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get("/withdraw-requests", this.withdrawRequestController.getWithdrawRequestBySender);
    }
}
