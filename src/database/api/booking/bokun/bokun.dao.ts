import * as crypto from 'crypto';
import * as dateFormat from 'dateformat';
import { AxiosRequestConfig } from 'axios';
import {
    BookingDao, IAccessHeaderCreator, IBookingDaoActions, IBookingRecord, ICustomerAPIAccess
} from '../booking.model';

const DEFAULT_ACCESS_KEY = '5ea8219ba5fe4f7c9e7cf905f9a887f1';
const DEFAULT_SECRET_KEY = 'dfd0cf6b86ab49918a9e92031d166fa5';

export class BokunAccessHeaderCreator implements IAccessHeaderCreator {
    private accessKey: string;
    private secretKey: string;

    constructor(accessKey: string = DEFAULT_ACCESS_KEY, secretKey: string = DEFAULT_SECRET_KEY) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    private encodeSignature(date: string, method: string, path: string): string {
        return crypto.createHmac('sha1', this.secretKey)
            .update(
                date + this.accessKey + method + path
            ).digest('base64');
    }

    public create(method: string, path: string): any {
        const date = dateFormat(new Date(), 'yyyy-mm-dd HH:mm:ss');
        const headers = {
            'X-Bokun-Date': date,
            'X-Bokun-AccessKey': this.accessKey,
            'X-Bokun-Signature': this.encodeSignature(date, method, path)
        };

        return headers;
    }
}

export class BokunDao extends BookingDao {
    constructor() {
        super('https://api.bokun.io');
    }

    public getActions(customerAPIAccess: ICustomerAPIAccess): IBookingDaoActions {
        const accessHeaderCreator = new BokunAccessHeaderCreator(customerAPIAccess.accessKey, customerAPIAccess.secretKey);

        return {
            getBookings: () => this.getBookings(accessHeaderCreator)
        }
    }

    public getBookings(accessHeaderCreator: IAccessHeaderCreator): Promise<Array<IBookingRecord>> {
        // TODO: improve with 'fields' and 'pageSize: ALL', need to dig deeper in spec
        const axiosRequestConfig: AxiosRequestConfig = {
            method: 'POST',
            url: '/booking.json/product-booking-search',
            data: {
                pageSize: 1
            }
        };

        return this.request(accessHeaderCreator, axiosRequestConfig)
            .then((res) => {
                axiosRequestConfig.data = { pageSize: res.data.totalHits };
                return this.request(accessHeaderCreator, axiosRequestConfig);
            })
            .then((res) => res.data.results.map((booking) => {
                return {
                    id: booking.id,
                    creationDate: booking.creationDate && new Date(booking.creationDate),
                    startDate: booking.startDate && new Date(booking.startDate),
                    endDate: booking.endDate && new Date(booking.endDate),
                    customer: {
                        email: booking.customer && booking.customer.email,
                        firstName: booking.customer && booking.customer.firstName,
                        lastName: booking.customer && booking.customer.lastName,
                        address: booking.customer && booking.customer.address
                    }
                };
            }))
            .catch((err) => err.response.data);
    }
}
