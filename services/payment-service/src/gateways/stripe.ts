import Stripe from "stripe";
import { appConfig } from "../app-config";
import logger from "../lib/logger";

const STRIPE_PUBLISHABLE_KEY = appConfig.STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRECT = appConfig.STRIPE_SECRET_KEY;
const STRIPE_ENDPOINT_SECRET = appConfig.STRIPE_ENDPOINT_SECRET;

class StripeGateway {
    private static _instance: StripeGateway;
    private _stripe: Stripe;

    private constructor() {
        this._stripe = new Stripe(STRIPE_SECRECT, {
            apiVersion: '2025-06-30.basil',
        });
    }

    public static getInstance() {
        if (!StripeGateway._instance) {
            StripeGateway._instance = new StripeGateway();
        }

        return StripeGateway._instance; 
    }

    getConfig() {
        return {
            pubKey: STRIPE_PUBLISHABLE_KEY,
            merchantId: ''
        }
    }

    async constructEvent(body: string | Buffer, signature: string | string[] | Buffer<ArrayBufferLike>| undefined) {
        try {
            return this._stripe.webhooks.constructEvent(body, signature!, STRIPE_ENDPOINT_SECRET);
        } catch (error) {
            logger.error('Error constructing Stripe event', error);
            return null;
        }
    }

    async createCustomer(uid: string) {
        try {
            const customer = await this._stripe.customers.create({ metadata: { user_id: uid } });
            return customer.id;
        } catch (error) {
            logger.error('Error creating customer', error);
            throw error;
        }
    }

    async createPaymentIntent(payload: { amount: number, currency: string, customer_id: string, payment_method_id?: string, metadata: object}) {
        try {
            if (!payload.amount || !payload.currency) {
                throw new Error("Amount and currency are required");
            }

            const params: Stripe.PaymentIntentCreateParams = {
                amount: Math.round(payload.amount * 100),
                currency: payload.currency,
                customer: payload.customer_id,
                metadata: { ...payload.metadata }
            };

            if (payload.payment_method_id) {
                params.payment_method = payload.payment_method_id;
                params.confirm = true,
                params.off_session = true;
            }

            const intent = await this._stripe.paymentIntents.create(params);

            return {
                secret: intent.client_secret,
                status: intent.status,
                id: intent.id
            };
        } catch (error) {
            logger.error('Error creating payment intent', error);
            throw error;
        }
    }

    async createSetupIntent(customerId: string) {
        try {
            const intent = await this._stripe.setupIntents.create({
                customer: customerId,
                usage: 'off_session',
                automatic_payment_methods: { enabled: true },
            });

            return {
                secret: intent.client_secret
            }
        } catch (error) {
            logger.error('Error creating setup intent', error);
            throw error;
        }
    }

    async listPaymentMethods(customerId: string) {
        try {
            const paymentMethods = await this._stripe.customers.listPaymentMethods(customerId, {
                limit: 10,
            });

            return paymentMethods.data;
        } catch (error) {
            logger.error('Error listing payment methods', error);
            throw error;
        }
    }

    async removePaymentMethod(paymentMethodId: string) {
        try {
            await this._stripe.paymentMethods.detach(paymentMethodId);
        } catch (error) {
            logger.error('Error removing payment method', error);
            throw error;
        }
    }
}

export default StripeGateway;