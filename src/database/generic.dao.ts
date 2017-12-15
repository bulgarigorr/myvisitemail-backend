import * as MongoClient from 'mongoose';

export class GenericDao {
    private Model: MongoClient.Model<any>;

    constructor (schema, modelName) {
        try {
            this.Model = MongoClient.model(modelName);
        } catch (error) {
            this.Model = MongoClient.model(modelName, schema);
        }
    }

    public getModel() {
        return this.Model;
    }

    public getAll() {
        return this.Model.find({}).exec();
    }

    public queryAll(queryObj) {
        return this.Model.find(queryObj).exec();
    }

    public querySingle(queryObj) {
        return new Promise <any> ((resolve, reject) => {
            this.Model.findOne(queryObj).then(resolve).catch(reject);
        });
    }

    public create(createData): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const obj = new this.Model(createData);

            obj.save().then(resolve).catch(reject);
        });
    }

    public createWithUniqueCheck(createData, queryObj): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.querySingle(queryObj)
                .then((response) => {
                    if (response) {
                        reject('Key duplication detected');
                    } else {
                        let obj = new this.Model(createData);
                        obj.save().then(resolve).catch(reject);
                    }
                })
                .catch(reject);
        });
    }

    public update(itemId, updateData): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.Model.findById(itemId)
                .then((item) => {
                    for (let key in updateData) {
                        if (!item[key] && item[key] !== 0) {    // carefull around falsy values
                            reject('Attempted to update a non existeny property.');
                            return;
                        }
                    }
                    item.set(updateData);
                    item.save().then(resolve).catch(reject);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);;
                });
        });
    }

    public remove(itemId) {
        return this.Model.findOneAndRemove({ _id: itemId }).exec();
    }
    
    public removeByCustomId(itemId) {
        return this.Model.findOneAndRemove({ id: itemId }).exec();
    }
}