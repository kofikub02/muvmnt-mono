import { Response, Request } from "express"
import { errorResponse, successResponse, STATUS_CODES } from "@repo/lib";
import { ActorsRepository } from "../repository/actors.repository";
import { validateCreateStripePaymentIntentRequest } from "../validations/stripe.validations";
import StripeGateway from "../gateways/stripe";
import logger from "../lib/logger";
import { TransactionsRepository } from "../repository/transactions.repository";
import Stripe from "stripe";
import { updateOrder } from "../producers/update-order";

export class StripeController {
    private actorRepository: ActorsRepository;
    private transactionRepository: TransactionsRepository;

    constructor(actorsRepo: ActorsRepository, transactionsRepo: TransactionsRepository) {
        this.actorRepository = actorsRepo;
        this.transactionRepository = transactionsRepo;
    }

    getConfig = async (req: Request, res: Response) => {
        res.status(STATUS_CODES.OK).send(successResponse(StripeGateway.getInstance().getConfig()));
    }

    setupIntent = async (req: Request, res: Response) => {
        const { uid } = req.user;
        let actor = await this.actorRepository.findOneByAttr({ uid });

        let stripeCustomerId;
        if (actor) {
            stripeCustomerId = actor.stripeCustomerId;
            if (!stripeCustomerId) {
                stripeCustomerId = await StripeGateway.getInstance().createCustomer(uid);
                await this.actorRepository.update(actor.id, { stripeCustomerId });
            }
        } else {
            stripeCustomerId = await StripeGateway.getInstance().createCustomer(uid);
            await this.actorRepository.create({ uid, stripeCustomerId });
        }

        const payload = await StripeGateway.getInstance().createSetupIntent(stripeCustomerId);
        res.status(STATUS_CODES.OK).send(successResponse(payload));
    } 

    createPayment = async (req: Request, res: Response) => {
        const { error, value } = validateCreateStripePaymentIntentRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }
        
        const { uid } = req.user;
        const { amount, currency, payment_method_id, entity, entity_id } = value;
        const paymentPayload: any = { amount, currency, payment_method_id, metadata: { uid, entity, entity_id } };

        let actor = await this.actorRepository.findOneByAttr({ uid });  
        if (!actor) {
            actor = await this.actorRepository.create({ uid });
        }

        let stripeCustomerId = actor.stripeCustomerId;
        if (stripeCustomerId) {
            paymentPayload['customer_id'] = stripeCustomerId;
        } else {
            const stripeCustomerId = await StripeGateway.getInstance().createCustomer(uid);
            paymentPayload['customer_id'] = stripeCustomerId;
        }
        
        const payload = await StripeGateway.getInstance().createPaymentIntent(paymentPayload);
        res.status(STATUS_CODES.OK).send(successResponse(payload));
    }

    confirmPayment = async (req: Request, res: Response) => {

    }

    getCardPaymentMethods = async (req: Request, res: Response) => {
        const { uid } = req.user;

        let actor = await this.actorRepository.findOneByAttr({ uid });
        if (!actor) {
            res.status(STATUS_CODES.OK).send(successResponse([]));
            return;
        }

        const stripeCustomerId = actor.stripeCustomerId;

        if (!stripeCustomerId) {
            res.status(STATUS_CODES.OK).send(successResponse([]));
            return;
        }
        const methods = await StripeGateway.getInstance().listPaymentMethods(stripeCustomerId);
        res.status(STATUS_CODES.OK).send(successResponse(methods));
    }

    removePaymentMethod = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Bad request'));
            return;
        }

        try {
            await StripeGateway.getInstance().removePaymentMethod(id);
            res.status(STATUS_CODES.NO_CONTENT).send(successResponse(null));
        } catch (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Invalid Request'));
        }
    }

    webhookHandler = async (req: Request, res: Response) => {
        let event = await StripeGateway.getInstance().constructEvent(req.body, req.headers['stripe-signature']);
        
        if (event) {
            console.log(event.type);
            switch (event.type) {
                case 'payment_intent.created':
                    await this._handlePaymentIntentObject(event.data.object, 'pending');
                    break;
                case 'payment_intent.succeeded':
                    await this._handlePaymentIntentObject(event.data.object, 'completed');
                    break;
                case 'payment_intent.payment_failed':
                    const intent = event.data.object;
                    const message = intent.last_payment_error && intent.last_payment_error.message;
                    await this._handlePaymentIntentObject(event.data.object, 'failed');
                    break;
                case 'payment_intent.canceled':
                    await this._handlePaymentIntentObject(event.data.object, 'cancelled');
                    break;
                default:
                    logger.warn(`Unhandled event type: ${event.type}`);
            }
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Stripe Webhook Error: '));
            return;
        }
        
        res.status(STATUS_CODES.OK).json({ received: true });
    }

    _handlePaymentIntentObject = async (object: Stripe.PaymentIntent, status: 'pending'| 'completed' | 'failed' | 'cancelled') => {
        await this.transactionRepository.postTransaction({
            uid: object.metadata.uid,
            reference: object.id,
            amount: object.amount,
            currency: object.currency,
            entity: object.metadata.entity,
            entity_id: object.metadata.entity_id,
            type: 'payment',
            payment_gateway: 'stripe',
            status,
            payment_method_id: object.payment_method as string,
        });

        if (object.metadata.entity === 'order' || status !== 'pending') {
            await updateOrder({ uid: object.metadata.uid }, { order_id: object.metadata.entity_id, action_data: { status } })
        }
    }
}