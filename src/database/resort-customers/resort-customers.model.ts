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
    templateFolderId: string;
    bookedTemplate: ITemplateData;
    beforeCheckInTemplate: ITemplateData;
    afterCheckOutTemplate: ITemplateData;
    cancellationTemplate: ITemplateData;
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
    folderId: string; // folder_id
}

export interface ITemplateData {
    templateId: string;
    html: string;
}
