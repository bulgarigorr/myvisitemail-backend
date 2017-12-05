import * as Express from 'express';
import { UserDao } from '../database/user/user.dao';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

export class UserRoute {
    router: Express.Router;

    jsonParser = bodyParser.json();
    dao = new UserDao();

    constructor() {
        this.router = Express.Router();

        this.router.get('/', (req, res) => {
            this.dao.getAll()
                .then((users) => {
                    res.status(200).json(users);
                })
                .catch((error) => {
                    res.status(500).send('Database error.');
                });
        });

        this.router.post('/', this.jsonParser, (req, res) => {
            const createData = req.body;
            if (Object.keys(createData).length && createData.eMail) {
                this.dao.createWithUniqueCheck(createData, { eMail: createData.eMail })
                    .then(response => {
                        res.status(200).json(response);
                    })
                    .catch(error => {
                        res.status(500).json(error);
                    });
            } else {
                res.status(400).send('Insufficient data.');
            }
        });

        this.router.put('/', (req, res) => {
            res.status(400).send('Missing userId parameter.');
        });

        this.router.put('/:userId', this.jsonParser, (req, res) => {
            const id = req.params.userId;
            const updateData = req.body;
            if (Object.keys(updateData).length) {
                this.dao.update(id, updateData)
                    .then(response => {
                        res.status(200).json(response);
                    })
                    .catch(error => {
                        res.status(500).json(error);
                    });
            } else {
                res.status(400).send('Insufficient data.');
            }
        });

        this.router.post('/login', this.jsonParser, (req, res) => {
            const userCandidate = req.body;
            if (Object.keys(userCandidate).length) {
                if (userCandidate.eMail) {
                    if (userCandidate.password) {
                        this.dao.login(userCandidate.eMail, userCandidate.password)
                            .then((logged) => {
                                res.status(200).json(logged);
                            })
                            .catch((error) => {
                                res.status(500).send(error || 'Wrong credentials.');
                            });
                    } else {
                        res.status(400).send('eMail is required');
                    }
                } else {
                    res.status(400).send('eMail is required');
                }
            }
        });

        this.router.delete('/', (req, res) => {
            res.status(400).send('Missing userId parameter.');
        });

        this.router.delete('/:userId', (req, res) => {
            this.dao.remove(req.params.userId)
                .then(response => {
                    res.status(200).json('User ' + response.firstName + ' deleted');
                })
                .catch(error => {
                    res.status(500).json(error);
                });
        });
    }
}
