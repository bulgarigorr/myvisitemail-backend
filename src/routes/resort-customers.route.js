"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const bodyParser = require("body-parser");
const resort_customer_dao_1 = require("../database/resort-customers/resort-customer.dao");
const removed_customer_dao_1 = require("../database/resort-customers/removed-customer.dao");
const files_dao_1 = require("../database/files/files.dao");
class ResortCustomersRoute {
    constructor() {
        this.jsonParser = bodyParser.json();
        this.dao = new resort_customer_dao_1.CustomerDao();
        this.router = Express.Router();
        this.removedDao = new removed_customer_dao_1.RemovedCustomerDao();
        this.router.get('/all', (req, res) => {
            this.dao.getAll()
                .then(result => {
                res.status(200).json(result);
            })
                .catch(error => {
                res.status(500).send(error);
            });
        });
        this.router.get('/removed', (req, res) => {
            let result;
            try {
                result = this.removedDao.filterList();
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Something went wrong');
                return;
            }
            res.status(200).json(result);
        });
        this.router.get('/detail', (req, res) => {
            res.status(400).send('Resort id missing!');
        });
        this.router.get('/detail/:resortId', (req, res) => {
            const resortId = req.params.resortId;
            this.dao.getCustomerById(resortId)
                .then(customer => {
                if (customer.backgroundId) {
                    const fileDao = new files_dao_1.FileDao();
                    fileDao.getFile(customer.backgroundId)
                        .then(file => {
                        customer.backgroundId = file.file;
                        res.status(200).json(customer);
                    })
                        .catch(error => {
                        console.error(error);
                        res.status(500).send(error);
                    });
                }
                else {
                    res.status(200).json(customer);
                }
            })
                .catch(error => {
                console.error(error);
                res.status(500).send(error);
            });
        });
        this.router.get('/reports/:email', (req, res) => {
            const email = req.params.email;
            let result;
            try {
                result = this.dao.getReportsByCustomerEmail(email);
            }
            catch (error) {
                console.error(error);
                res.status(500).send(error);
                return;
            }
            res.status(204);
        });
        this.router.post('/', this.jsonParser, (req, res) => {
            const createData = req.body;
            if (Object.keys(createData).length &&
                createData.contact &&
                createData.contact.email) {
                createData.metadata = {
                    creationDate: new Date().getTime(),
                    updateDate: null
                };
                this.dao.createWithUniqueCheck(createData, {
                    contact: {
                        email: createData.contact.email
                    }
                })
                    .then(response => {
                    res.status(200).json(response);
                })
                    .catch(error => {
                    res.status(500).json({ message: 'Error saving to database' });
                });
            }
            else {
                res.status(400).send('Insufficient data.');
            }
        });
        this.router.put('/', (req, res) => {
            res.status(400).send('Missing userId parameter.');
        });
        this.router.put('/:resortId', this.jsonParser, (req, res) => {
            const id = req.params.resortId;
            const updateData = req.body;
            delete updateData._id;
            if (Object.keys(updateData).length) {
                if (!updateData.metadata) {
                    updateData.metadata = {};
                }
                updateData.metadata.updateDate = new Date().getTime();
                this.dao.update(id, updateData)
                    .then(response => {
                    res.status(200).json(response);
                })
                    .catch(error => {
                    console.error(error);
                    res.status(500).json({ message: 'Error saving to database' });
                });
            }
            else {
                res.status(400).send('Insufficient data.');
            }
        });
        this.router.delete('/:resortId', async (req, res) => {
            const resortId = req.params.resortId;
            try {
                await this.dao.removeComplete(resortId);
            }
            catch (error) {
                if (error.status === 404) {
                    try { // remove this after all tests pass
                        await this.dao.remove(resortId);
                    }
                    catch (err) {
                        console.error(error);
                        res.status(500).send('Error writing to DB');
                        return;
                    }
                }
                else {
                    console.error(error);
                    res.status(500).send('Error writing to DB');
                    return;
                }
            }
            try {
                this.removedDao.filterList();
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error clearing removal list');
                return;
            }
            try {
                this.removedDao.create({
                    removedDate: new Date().getTime()
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error adding removal info');
                return;
            }
            res.status(200).send('OK!');
        });
    }
}
exports.ResortCustomersRoute = ResortCustomersRoute;
//# sourceMappingURL=resort-customers.route.js.map