import * as Express from 'express';
import * as bodyParser from 'body-parser';
import { MailchimpDao } from '../database/mailchimp/mailchimp.dao';

export class MailchimpRoute {
    router: Express.Router;
    jsonParser = bodyParser.json();

    private dao: MailchimpDao = new MailchimpDao('');
    constructor() {

        this.router = Express.Router();

        this.router.get('/list', (req, res) => {
            this.dao.getLists()
                .then((result) => {
                    res.status(200).json(result.lists);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.get('/list/:id', (req, res) => {
            this.dao.getListById(req.params.id)
                .then((list) => {
                    res.status(200).json(list);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.get('/report', (req, res) => {
            this.dao.getReports()
                .then((result) => {
                    res.status(200).json(result.reports);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.get('/report/:campaignId', (req, res) => {
            const campaignId = req.params.campaignId;
            this.dao.getReportsFor(campaignId)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    if (error.status) {
                        return res.status(error.status).send(error);
                    } else {
                        res.status(500).send(error);
                    }
                });
        });

        this.router.get('/campaign', (req, res) => {
            this.dao.getCampaigns()
                .then((result) => {
                    res.status(200).json(result.campaigns);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.get('/automations', (req, res) => {
            this.dao.getAutomations()
                .then((list) => {
                    res.status(200).json(list);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.put('/template/:templateId', this.jsonParser, (req, res) => {
            this.dao.updateTemplate(req.params.templateId, req.body)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send(error);
                });
        });

        this.router.post('/list', this.jsonParser, (req, res) => {
            this.dao.createList(req.body)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.put('/list/:listId', this.jsonParser, (req, res) => {
            this.dao.updateList(req.params.listId, req.body)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.post('/campaign', this.jsonParser, (req, res) => { // 'Insufficient data.'
            const createData = req.body;

            if (Object.keys(createData).length && createData.recipients) {
                console.log('Creating campaign', createData);
                if (this.dao.isComplete(createData)) {
                    this.dao.createCampaign(createData)
                        .then((result) => {
                            res.status(200).json(result);
                        })
                        .catch((error) => {
                            res.status(500).send(error);
                        });
                } else {
                    res.status(500).send('Campaign is incomplete!');
                }
            } else {
                res.status(400).send('Insufficient data.');
            }
        });

        this.router.patch('/campaign/', (req, res) => {
            res.status(400).send('Missing campaignId parameter.');
        });

        this.router.patch('/campaign/:campaignId', this.jsonParser, (req, res) => {
            const createData = req.body;

            if (Object.keys(createData).length) {
                this.dao.updateCampaign(req.body, req.params.campaignId)
                    .then((result) => {
                        res.status(200).json(result);
                    })
                    .catch((error) => {
                        res.status(500).send(error);
                    });
            } else {
                res.status(400).send('Insufficient data.');
            }
        });

        this.router.delete('/campaign/:campaignId', (req, res) => {
            this.dao.deleteCampaign(req.params.campaignId)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        });

        this.router.post('/campaign/:campaignId/:action', (req, res) => {
            const action = req.params.action;
            const campaignId = req.params.campaignId;
            const options = req.body || {};
            try {
                this.dao.performCampaignAction(campaignId, action, options)
                    .then((result) => {
                        res.status(200).json(result);
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send(error);
                    });
            } catch (error) {
                res.status(500).send('Attempted to schedule a campaign with no schedule time!');
            }
        });

        this.router.post('/test', this.jsonParser, (req, res) => {
            const testData = req.body;
            this.dao.createAndTestCampaign(testData.templateData, testData.emails)
                .then(resp => {
                    res.status(200).json({
                        message: resp
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json(err)
                });
        });

        this.router.delete('/test/:templateId', async (req, res) => {
            let result;
            let tempId = Number.parseInt(req.params.templateId);
            try {
                result = await this.dao.clearTestCampaignsByTemplateUsed(tempId);
            } catch (err) {
                res.status(500).json(err);
                return;
            }
            res.status(200).json(result);
        });
    }
}
