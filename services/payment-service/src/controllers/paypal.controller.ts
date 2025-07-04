import { Response, Request } from "express";
import { errorResponse, successResponse, STATUS_CODES } from "@repo/lib";
import PaypalGateway from "../gateways/paypal";
import { ActorsRepository } from "../repository/actors.repository";
import { validateCreatePaymentToken, validateCreatePaypalPaymentRequest } from "../validations/paypal.validations";
import logger from "../lib/logger";
import { TransactionsRepository } from "../repository/transactions.repository";

export class PayPalController {
    private actorRepository: ActorsRepository;
    private transactionRepository: TransactionsRepository;

    constructor(actorsRepo: ActorsRepository, transactionsRepo: TransactionsRepository) {
        this.actorRepository = actorsRepo;
        this.transactionRepository = transactionsRepo;
    }

    successHandler = async (req: Request, res: Response) => {
        const { type } = req.params;

        switch (type) {
            case 'setup':
                const { approval_token } = req.query;
                logger.info('Setup Success:', approval_token);
                break;
            case 'payment':
                const { token } = req.query;
                logger.info('Payment Success:', token);
                break;
            default:
                break;
        }

        res.status(STATUS_CODES.OK).send(successResponse('Success'));
    }

    cancelHandler = async (req: Request, res: Response) => {
        res.status(STATUS_CODES.OK).send(successResponse('Cancelled'));
    }

    setupToken = async (req: Request, res: Response) => {
        const { uid } = req.user;


        let paypalCustomerId;
        let actor = await this.actorRepository.findOneByAttr({ uid });
        if (actor) {
            paypalCustomerId = actor.paypalCustomerId;
        } else {
            actor = await this.actorRepository.create({ uid });
        }

        const setup = await PaypalGateway.getInstance().createSetupToken({ customerId: paypalCustomerId });

        paypalCustomerId = setup.customer.id;
        await this.actorRepository.update(actor.id, { paypalCustomerId })

        const tokenPayload = { token_id: setup.id, approval_url: setup.links.find((link: { rel: string; }) => link.rel === 'approve')?.href };
        
        res.status(STATUS_CODES.OK).send(successResponse(tokenPayload));
    }

    paymentToken = async (req: Request, res: Response) => {
        const { error, value } = validateCreatePaymentToken(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }

        const { setupTokenId } = value;

        const token = await PaypalGateway.getInstance().createPaymentToken(setupTokenId);
        if (!token) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Bad request'));
            return;
        }

        const formattedToken = {
            id: token.id,
            maskedInfo: {
                email: token.payment_source?.paypal?.email_address,
            }
        }
        
        res.status(STATUS_CODES.OK).send(successResponse(formattedToken))
    }

    getPaymentMethods = async (req: Request, res: Response) => {
        const { uid } = req.user;

        const actor = await this.actorRepository.findOneByAttr({ uid });
        if (!actor) {
            res.status(STATUS_CODES.OK).send(successResponse([]));
            return;
        } 

        const paypalCustomerId = actor.paypalCustomerId;
        if (!paypalCustomerId) {
            res.status(STATUS_CODES.OK).send(successResponse([]));
            return;
        }

        const paymentTokens = await PaypalGateway.getInstance().getPaymentTokens(paypalCustomerId);

        if (!paymentTokens) {
            res.status(STATUS_CODES.OK).send(successResponse([]));
            return;
        }

        const formattedTokens = paymentTokens.map((token: { id: any; payment_source: { paypal: { email_address: any; account_id: any; }; }; create_time: any; }) => ({
            id: token.id,
            maskedInfo: {
                email: token.payment_source?.paypal?.email_address,
            }
        }));

        res.status(STATUS_CODES.OK).send(successResponse(formattedTokens));
    }

    removePaymentMethod = async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            await PaypalGateway.getInstance().removePaymentToken(id);
            res.status(STATUS_CODES.NO_CONTENT).send(successResponse(null));
        } catch (error) {
            res.status(STATUS_CODES.NOT_FOUND).send(errorResponse('Not found'));
        }
    }

    createPayment = async (req: Request, res: Response) => {
        const { error, value } = validateCreatePaypalPaymentRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse(error.details[0].message));
            return;
        }
        const { uid } = req.user;
        const { amount, currency, payment_method_id, entity, entity_id } = value;


        const payment = await PaypalGateway.getInstance().createPayment({
            amount,
            currency,
            payment_method_id,
            metadata: { uid, entity, entity_id }
        });

        if (!payment) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Payment creation failed'));
            return;
        }

        res.status(STATUS_CODES.OK).send(successResponse({
            id: payment.id,
            status: payment.status,
            status_url: payment.links.find((link: { rel: string; }) => link.rel === 'payer-action')?.href
        }));
    }

    capturePayment = async (req: Request, res: Response) => {
        const { id } = req.params;

        const capture = await PaypalGateway.getInstance().confirmPayment(id);
        if (!capture) {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Payment capture failed'));
            return;
        }

        if (capture.status !== 'COMPLETED') {
            res.status(STATUS_CODES.BAD_REQUEST).send(errorResponse('Payment not completed or failed'));
            return;
        }

        res.status(STATUS_CODES.OK).send(successResponse({
            id: capture.id,
            status: capture.status,
        }));
    }

    webhookHandler = async (req: Request, res: Response) => {
        
    }
}