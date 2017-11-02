import * as Express from 'express';
import { IRoute } from '../models/routes-models';
import { UserRoute } from './user-route';

const userRoute = new UserRoute();
export class AuthRoutes implements IRoute {
    constructor(private app: Express.Application, private router: Express.Router) {
    }

    register() {
        this.app.use('/', this.router);
        this.app.use('/user', userRoute.router);
    }
}