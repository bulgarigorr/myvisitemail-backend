import { BaseModel } from '../base.model';
import * as MongoClient from 'mongoose';

export class FileModel extends BaseModel {
    constructor(schemaObj) {
        super((schemaObj || {
            id: {
                type: String,
                required: true
            },
            type: {
                type: Number,
                required: true
            },
            file: {
                type: Buffer,
                required: true
            },
            contentType: {
                type: String,
                required: false
            }
        }));
    }
}

export enum FileType {
    UserAvatar = 0, // marge it with Image?
    Image = 1,
    Video = 2,
    Document = 3,
    Other = 4,
    TestFile = 5
}

export interface IFile {
    _id: MongoClient.Types.ObjectId | string;
    id: string;
    type: FileType;
    file: any;
    contentType: string;
}
