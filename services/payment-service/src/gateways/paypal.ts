import axios from "axios";
import { appConfig } from "../app-config";
import logger from "../lib/logger";
import { custom } from "joi";

const PAYPAL_URL = appConfig.PAYPAL_URL;
const PAYPAL_SECRET_KEY = appConfig.PAYPAL_SECRET_KEY;
const PAYPAL_CLIENT_ID = appConfig.PAYPAL_CLIENT_ID;
const baseUrl = appConfig.GATEWAY_URL;

class PaypalGateway {
    private static _instance: PaypalGateway;

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    public static getInstance() {
        if (!PaypalGateway._instance) {
            PaypalGateway._instance = new PaypalGateway();
        }

        return PaypalGateway._instance; 
    }

    private _generateRequestId(): String {
        return Date.now().toString() + Math.random().toString(36).substring(7);
    }

    private async _getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`).toString('base64');
        const res = await fetch(`${PAYPAL_URL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });
        
        if (!res.ok) {
            throw new Error("Failed to get PayPal access token");
        }

        const data = await res.json();
        return data.access_token;
    }

    getConfig() {
        return {
            pubKey: PAYPAL_CLIENT_ID
        }
    }

    async constructEvent(body: string | Buffer, signature: string | string[] | undefined): Promise<any> {
        const accessToken = await this._getAccessToken();

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };

        try {
            const response = await axios.get(`${PAYPAL_URL}/v1/notifications/webhooks-events-transmissions`, { headers });

            if ( response.status === 200) {
                return response.data;
            }
        } catch (error) {
            logger.error('PayPal constructEvent error:', error);
            return null;
        }
    }

    async createSetupToken({ customerId, locale = 'en-US' }: { customerId?: string, locale?: string }) {
        const accessToken = await this._getAccessToken();

        let data: any = {
            payment_source: {
                paypal: {
                    description: "Description for Paypal to be shown to Paypal user",
                    permit_multiple_payment_tokens: false,
                    usage_pattern: "IMMEDIATE",
                    usage_type: "MERCHANT",
                    customer_type: "CONSUMER",
                    experience_context: {
                        payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                        locale: locale,
                        brand_name: "Muvmnt",
                        returnUrl: `${baseUrl}/payments/paypal/succes/setup`, 
                        cancelUrl: `${baseUrl}/payments/paypal/cancel`
                    }
                }
            },
        };

        if (customerId) {
            data = {
                ...data,
                customer: { id: customerId }
            }
        }

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };
        
        try {
            const response = await axios.post(`${PAYPAL_URL}/v3/vault/setup-tokens`, JSON.stringify(data), { headers });

            if (response.status === 201 || response.status === 200) {
                return response.data;
            }
        } catch (error) {
            logger.error('PayPal createSetupToken error:', error);
            return null;
        }
    }

    async createPaymentToken(setupTokenId: string) {
        const accessToken = await this._getAccessToken();

        const data = JSON.stringify({
            payment_source: {
                token: {
                    id: setupTokenId,
                    type: 'SETUP_TOKEN'
                }
            }
        });

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };

        try {
            const response = await axios.post(`${PAYPAL_URL}/v3/vault/payment-tokens`, data, { headers });

            if (response.status === 201 || response.status === 200) {
                return response.data;
            } 

            logger.error('PayPal createPaymentToken response status:', response.data);
        } catch (error) {
            logger.error('PayPal createPaymentToken error:', error);
            return null;
        }
    }

    async getPaymentTokens(customerId: string) {
        const accessToken = await this._getAccessToken();

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };

        try {
            const response = await axios.get(`${PAYPAL_URL}/v3/vault/payment-tokens?customer_id=${customerId}`, { headers });

            if (response.status === 200) {
                return response.data.payment_tokens || [];
            }
        } catch (error) {
            logger.error('PayPal getPaymentToken error:', error);
            return null;
        }
    }

    async removePaymentToken(tokenId: string): Promise<boolean> {
        const accessToken = await this._getAccessToken();

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };

        try {
            const response = await axios.delete(`${PAYPAL_URL}/v3/vault/payment-tokens/${tokenId}`, { headers });

            if (response.status == 204) {
                return true;
            }
        } catch (error) {
            logger.error('PayPal removePaymentToken error:', error);
        } finally {
            return false;
        }
        
    }

    async createPayment(paymentData: { amount: number, currency: string, payment_method_id?: string, locale?: string, metadata: any }): Promise<any> {
        const accessToken = await this._getAccessToken();

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };

        const data = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: paymentData.currency,
                        value: paymentData.amount,
                        breakdown: {
                            item_total: {
                                currency_code: paymentData.currency,
                                value: paymentData.amount.toString()
                            }
                        }
                    },
                    custom_id: `${paymentData.metadata.entity}+${paymentData.metadata.entity_id}` || '',
                }
            ],
            payment_source: paymentData.payment_method_id
                ? { paypal: { vault_id: paymentData.payment_method_id } }
                : { paypal: {
                        experience_context: {
                            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                            shipping_preference: "NO_SHIPPING",
                            user_action: "PAY_NOW",
                            returnUrl: `${baseUrl}/payments/paypal/success/payment`, 
                            cancelUrl: `${baseUrl}/payments/paypal/cancel`,
                            locale: paymentData.locale || 'en-US',
                            brand_name: "Muvmnt"
                        }
                    }
                }
        };
        
        try {
            const response = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, JSON.stringify(data), { headers });

            if (response.status === 200 || response.status === 201) {
                return response.data;
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                console.error('PayPal createPayment error:', (error as any).response.data);
            } else {
                console.error('PayPal createPayment error:', error);
            }
       
            return null;
        }
    }

    async confirmPayment(orderId: string): Promise<any> {
        const accessToken = await this._getAccessToken();

        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${accessToken}`, 
            'PayPal-Request-Id': `${this._generateRequestId()}`
        };

        try {
            const response = await axios.post(`${PAYPAL_URL}/v2/checkout/orders/${orderId}/capture`, {}, { headers });

            if (response.status === 200 || response.status === 201) {
                return response.data;
            }
        } catch (error) {
            logger.error('PayPal confirmPayment error:', error);
            return null;
        }
    }
}

export default PaypalGateway;
