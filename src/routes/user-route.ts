import * as Express from 'express';
import { UserDao } from '../database/user/userDao';
import * as bodyParser from'body-parser';
const jsonParser = bodyParser.json();
const dao = new UserDao();

export class UserRoute {
    router: Express.Router;
    constructor () {
        this.router = Express.Router();

        this.router.get('/', (req, res) => {
            dao.getAll()
                .then((users) => {
                    res.status(200).json(users);
                })
                .catch((error) => {
                    res.status(500).send('Database error.');
                })
        });

        this.router.post('/', jsonParser, (req, res) => {
            let createData = req.body;
            if (Object.keys(createData).length) {
                dao.create(createData)
                    .then(function (response) {
                        res.status(200).json(response);
                    })
                    .catch(function (error) {
                        res.status(500).json(error);
                    })
            } else {
                res.status(400).json('Insufficient data.');
            }
        });

        this.router.post('/canLogin', jsonParser, (req, res) => {
            var userCandidate = req.body;
            if (Object.keys(userCandidate).length) {
                if (userCandidate.eMail) {
                    if (userCandidate.password) {
                        dao.canLogin(userCandidate.eMail, userCandidate.password)
                            .then((logIN) => {
                                res.status(200).json(logIN);
                            })
                            .catch(error => {
                                res.status(500).json(error);
                            });
                    } else {
                        res.status(400).send('eMail is required');
                    }
                } else {
                    res.status(400).send('eMail is required');
                }
            }
        });

        this.router.put('/:userId', jsonParser, (req, res) => {
            let id = req.params.userId;
            let updateData = req.body;
            if (Object.keys(updateData).length) {
                dao.update(id, updateData)
                    .then(function (response) {
                        res.status(200).json(response);
                    })
                    .catch(function (error) {
                        res.status(500).json(error);
                    })
            } else {
                res.status(400).json('Insufficient data.');
            }
        });

        this.router.delete('/:userId', (req, res) => {
            dao.remove(req.params.userId)
                .then(function (response) {
                    res.status(200).json('User ' + response.firstName + ' deleted');
                })
                .catch(function (error) {
                    res.status(500).json(error);
                })
        });
    }
}