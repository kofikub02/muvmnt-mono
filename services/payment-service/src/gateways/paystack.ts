import axios from "axios";
import { appConfig } from "../app-config";
import logger from "../lib/logger";
import { createHmac } from "node:crypto";
import { MomoMethodsRepository } from "../repository/momo-methods.repository";
import { sendNotification } from "../producers/send-notification";
import { validateMongoObjectId } from "../validations/base";

const PAYSTACK_URL = appConfig.PAYSTACK_URL;
const PAYSTACK_SECRECT_KEY = appConfig.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = appConfig.PAYSTACK_PUBLIC_KEY;

export class PaystackService {
    private static _instance: PaystackService;
    private methodRepo: MomoMethodsRepository;

    public static getInstance() {
        if (!PaystackService._instance) {
            PaystackService._instance = new PaystackService();
        }

        return PaystackService._instance; 
    }

    private constructor() {
        this.methodRepo = new MomoMethodsRepository();
    }

    getConfig() {
        return {
            pubKey: PAYSTACK_PUBLIC_KEY
        }
    }

    async constructEvent(body: any, signature: string | string[] | undefined) {
        try {
            const hash = createHmac('sha512', PAYSTACK_SECRECT_KEY).update(JSON.stringify(body)).digest('hex');
            if (hash == signature) {
                return body;
            }
        } catch (error) {
            logger.error('PayStack construct event:', error);
        } finally {
            return null;
        }
    }

    /**     * Creates a payment using Paystack.
     * @param charge - The charge details including amount, currency, phone, provider, and orderId.
     * @returns The payment data if successful, otherwise throws an error.
     */
    async createPayment(charge: { amount: number, currency: string, phone: string, provider: string, metadata: object}) {
        try {
            const data = JSON.stringify({
                amount: Math.round(charge.amount * 100),
                email: `${charge.phone}@email.com`,
                currency: charge.currency,
                mobile_money: { 
                  phone: charge.phone, 
                  provider: charge.provider
                },
                metadata: {
                    ...charge.metadata,
                }
            });
    
            const headers = { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${PAYSTACK_SECRECT_KEY}`, 
            };
            
            const response = await axios.post(`${PAYSTACK_URL}/charge`, data, { headers });
    
            if (response.status === 200) {
                return response.data['data'];
            }
        } catch (error) {
            logger.error('createPayStackPayment gone wrong', error);
            return null;
        }
    }

    /**     * Verifies a Paystack payment using the provided reference.
     * @param reference - The payment reference to verify.
     * @returns The payment verification data if successful, otherwise null.
     */
    async verifyPayment(reference: string) {
        try {
            const headers = { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${PAYSTACK_SECRECT_KEY}`, 
            };
            
            const response = await axios.get(`${PAYSTACK_URL}/transaction/verify/${reference}`, { headers });
    
            if (response.status === 200) {
                return response.data['data'];
            }
            
            return null;
        } catch (error) {
            logger.error('verifyPayStackPayment gone wrong', error);
            throw error;
        }
    }

    /**     * Submits the OTP for Paystack payment verification.
     * @param validationObject - The object containing OTP and reference.
     * @returns The response data from Paystack.
     */
    async submitOtp(validationObject: { otp: string, reference: string }) {
        try {
            const data = JSON.stringify({
                otp: validationObject.otp,
                reference: validationObject.reference
            });
    
            const headers = { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${PAYSTACK_SECRECT_KEY}`, 
            };
            
            const response = await axios.post(`${PAYSTACK_URL}/charge/submit_otp`, data, { headers });
    
            if (response.status === 200) {
                return response.data['data'];
            }
 
            return null;
        } catch (error) {
            logger.error('createPayStackPayment gone work', error);
            throw error;
        }
    }

    /**     * Sets up a payment for the user.
     * @param payload - The payment details.
     * @returns The payment setup response.
     */
    async setupPaymentMethod(payload: { uid: string, phone: string, provider: string }) {
        try {
            const existingMethod = await this.methodRepo.findOneByAttr({ uid: payload.uid, phone: payload.phone, provider: payload.provider });
            if (existingMethod) {
                return {
                    id: existingMethod.id,
                    phone: existingMethod.phone,
                    provider: existingMethod.provider,
                };
            }  

            const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();

            const newMethod = await this.methodRepo.create({
                uid: payload.uid,
                phone: payload.phone,
                provider: payload.provider,
                otp: sixDigitCode,
            });

            await sendNotification(
                { uid: payload.uid, phone_number: payload.phone }, 
                { 
                    sms: {title: 'Mobile Money Verification', body: 'Your verification code is ' + sixDigitCode},
                });
            
            return {
                setup_id: newMethod.id,
                action: 'otp'
            }
        } catch (error) {
            logger.error('setupPayStackPayment gone wrong', error);
            throw error;
        }
    }

    /**
     * Creates a payment method for the user.
     * @param payload - The payment method details.
     * @returns The created payment method.
     */
    async createPaymentMethod(validation: { uid: string, method_id: string, otp: string }) {
        try {
            if (!validateMongoObjectId(validation.method_id)) {
                throw new Error('Invalid method ID');
            }

            const method = await this.methodRepo.findById(validation.method_id);
            if (!method) {
                throw new Error('Not found');
            }

            if (method.uid !== validation.uid) {
                throw new Error('Unauthorized');
            }

            if (method.otp !== validation.otp) {
                throw new Error('Invalid OTP');
            }

            await this.methodRepo.update(method.id, { verified: true, otp: undefined });

            return {
                id: method.id,
                phone: method.phone,
                provider: method.provider,
            };
        } catch (error) {
            logger.error('createPayStackPaymentMethod gone wrong', error);
            throw error;
        }
    }

    /**     * Retrieves all payment methods for a user.
     * @param uid - The user ID.
     * @returns An array of payment methods.
     */
    async getPaymentMethods(uid: string) {
        try {
            const methods = await this.methodRepo.findManyByAttr({ uid });
            return (methods || []).map(method => ({
                id: method.id,
                phone: method.phone,
                provider: method.provider,
            }));
        } catch (error) {
            logger.error('getPayStackPaymentMethods gone wrong', error);
            throw error;
        }
    }

    /**     * Removes a payment method by its ID.
     * @param id - The payment method ID.
     * @returns A success message.
     */
    async removePaymentMethod(id: string) {
        try {
            if (!validateMongoObjectId(id)) {
                throw new Error('Invalid method ID');
            }

            const method = await this.methodRepo.findById(id);
            if (!method) {
                throw new Error('Not found');
            }
            await this.methodRepo.delete(id);
            return { success: true };
        } catch (error) {
            logger.error('removePayStackPaymentMethod gone wrong', error);
            throw error;
        }
    }
}