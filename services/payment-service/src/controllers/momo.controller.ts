import { Response, Request } from "express"
import { errorResponse, successResponse, STATUS_CODES } from "@repo/lib";
import { ActorsRepository } from "../repository/actors.repository";
import { PaystackService } from "../gateways/paystack";
import { validateCreateMomoMethodRequest, validateCreateMomoPaymentRequest, validateSetupMomoMethodRequest, validateSubmitMomoPaymentOtp } from "../validations/momo.validations";
import { TransactionsRepository } from "../repository/transactions.repository";
import logger from "../lib/logger";
import { updateOrder } from "../producers/update-order";

export class MomoController {
    private actorRepository: ActorsRepository;
    private transactionRepository: TransactionsRepository;

    constructor(actorsRepo: ActorsRepository, transactionsRepo: TransactionsRepository) {
        this.actorRepository = actorsRepo;
        this.transactionRepository = transactionsRepo;
    }

    getConfig = async (req: Request, res: Response) => {
        res.status(STATUS_CODES.OK).send(successResponse(PaystackService.getInstance().getConfig()));
    }

    createMomoPayment = async (req: Request, res: Response) => {
        const { error, value } = validateCreateMomoPaymentRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }

        const { uid } = req.user;
        const { amount, currency, phone, provider, entity, entity_id } = value;

        const payload = await PaystackService.getInstance().createPayment({amount, currency, phone, provider, metadata: { entity, entity_id, uid } });
        if (!payload) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Unable to create payment'));
            return;
        }

        res.status(STATUS_CODES.OK).send(successResponse(payload));
    }

    submitMomoPaymentOTP = async (req: Request, res: Response) => {
        const { error, value } = validateSubmitMomoPaymentOtp(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }

        const payload = await PaystackService.getInstance().submitOtp(value);
        res.status(STATUS_CODES.OK).send(successResponse(payload));
    }

    verifyMomoPayment = async (req: Request, res: Response) => {
        const { ref } = req.params
        if (!ref) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Bad request'));
            return;
        }

        const payload = await PaystackService.getInstance().verifyPayment(ref);
        res.status(STATUS_CODES.OK).send(successResponse(payload));
    }

    setupMomoPaymentMethod = async (req: Request, res: Response) => {
        const { error, value } = validateSetupMomoMethodRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }
        const { uid } = req.user;

        const payload = await PaystackService.getInstance().setupPaymentMethod({ uid, ...value });
        console.log(payload);
        res.status(STATUS_CODES.OK).send(successResponse(payload));
    }

    createMomoPaymentMethod = async (req: Request, res: Response) => {
        const { error, value } = validateCreateMomoMethodRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }

        const { uid } = req.user;
        let payload;

        try {
            payload = await PaystackService.getInstance().createPaymentMethod({ ...value, uid });
        } catch (err) {
            const errorMessage = (err instanceof Error && err.message) ? err.message : 'Error creating payment method';
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(errorMessage));
            return;
        }

        res.status(STATUS_CODES.CREATED).send(successResponse(payload));
    }

    getMomoPaymentMethods = async (req: Request, res: Response) => {
        const { uid } = req.user;
        const payload = await PaystackService.getInstance().getPaymentMethods(uid);
        res.status(STATUS_CODES.OK).send(successResponse(payload));
    }

    removeMomoPaymentMethod = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Bad request'));
            return;
        }

        try {
            await PaystackService.getInstance().removePaymentMethod(id)
            res.status(STATUS_CODES.NO_CONTENT).send(successResponse(null));
        } catch (error) {
            res.status(STATUS_CODES.NOT_FOUND).send(errorResponse('Not found'));
        }
    }

    webhookHandler = async (req: Request, res: Response) => {
        let event = await PaystackService.getInstance().constructEvent(req.body, req.headers['x-paystack-signature']);
  
        if (event) {
            switch(event['type']) {
                case 'charge.success':
                    await this._handleChargeObject(event['data'], 'completed');
                    break;
                case 'transfer.success':
                    break;
                case 'transfer.failed':
                    break;
                case 'transfer.reverse':
                    break;
                default:
                    logger.warn(`Unhandled event type: ${event.type}`);
            }
        } else {

        }
        
        res.status(STATUS_CODES.OK).json({ received: true });
    }

    _handleChargeObject = async (object: any, status: 'pending'| 'completed' | 'failed' | 'cancelled') => {
        await this.transactionRepository.postTransaction({
            uid: object.metadata.uid,
            reference: object.reference,
            amount: object.amount,
            currency: object.currency,
            entity: object.metadata.entity,
            entity_id: object.metadata.entity_id,
            type: 'payment',
            payment_gateway: 'paystack',
            status,
            payment_method_id: object.payment_method as string,
        })
        
        if (object.metadata.entity === 'order' || status !== 'pending') {
            await updateOrder({ uid: object.metadata.uid }, { order_id: object.metadata.entity_id, action_data: { status } })
        }
    }
}