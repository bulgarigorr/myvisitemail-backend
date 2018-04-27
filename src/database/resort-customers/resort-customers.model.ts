export interface IResortCustomer {
    id: string;
    contact: ICustomerContact;
    type: string;
    area: string;
    rooms: number;
    lastSent: Date;
    invoice: number;
    reports: any[];
    backgroundId: string;
    metadata: IMetadata;
    APIAccess: IAPIAccess;
    templateFolderId: string;
    booked: ITemplateData;
    'check-in': ITemplateData;
    'check-out': ITemplateData;
    cancellation: ITemplateData;
    listId: string;
}

export interface IAPIAccess {
    bokun: IBokunAPIAccess
}

export interface IBokunAPIAccess {
    accessKey: string;
    secretKey: string;
}

export interface ICustomerContact {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface IMetadata {
    creationDate: number;
    updateDate: number;
}

export interface IResortCustomerTemplate {
    name: string;
    html: string;
    folder_id: string; // folder_id
}

export interface ITemplateData {
    templateId: string;
    subject: string;
    html: string;
    toUse: boolean;
}
