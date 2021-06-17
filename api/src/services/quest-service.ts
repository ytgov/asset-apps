import { Vendor } from "../data/models";
import axios from "axios";
import { API_GATEWAY_KEY } from "../config";

const TRANSACTION_API_URL = "https://api.gov.yk.ca/finance/transactions/search";
const VENDOR_API_URL = "https://api.gov.yk.ca/finance/transactions/search";

const RELEVANT_ACCOUNT = "12345"

export class QuestService {

    async findVendor(term: string) {
        return new Array<Vendor>();
    }

    async findPayments(vendor_id: string): Promise<any[]> {
        let body = { account: RELEVANT_ACCOUNT, vendorid: vendor_id };
        let authHeader = { "Ocp-Apim-Subscription-Key": API_GATEWAY_KEY };
        return axios.post(TRANSACTION_API_URL, body, { headers: authHeader })
            .then(resp => {
                return resp.data.data;
            })
            .catch(error => {
                return [];
            })
    }
}
