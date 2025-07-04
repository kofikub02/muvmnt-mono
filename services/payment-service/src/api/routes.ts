import { raw, Application, Router } from "express";
import { asyncHandler, authenticate } from "@repo/lib";
import { WalletController } from "../controllers/wallet.controller";
import { StripeController } from "../controllers/stripe.controller";
import { ActorsRepository } from "../repository/actors.repository";
import { MomoController } from "../controllers/momo.controller";
import { PayPalController } from "../controllers/paypal.controller";
import { TransactionsRepository } from "../repository/transactions.repository";

/**********************************
 * Controllers routes
 **********************************/
const actorRepository = new ActorsRepository();
const transactionRepository = new TransactionsRepository();

/**********************************
 * Controllers routes
 **********************************/
const stripeController = new StripeController(actorRepository, transactionRepository);
const momoController = new MomoController(actorRepository, transactionRepository);
const paypalController = new PayPalController(actorRepository, transactionRepository);
const walletController = new WalletController(actorRepository, transactionRepository);

/**********************************
 * Webhhook routes
 **********************************/
const webhooksRouter = Router();

webhooksRouter
    .post('/stripe', raw({type: 'application/json'}), stripeController.webhookHandler)
    .post('/paystack', raw({type: 'application/json'}), momoController.webhookHandler)
    .post('/paypal', raw({type: 'application/json'}), paypalController.webhookHandler);

export { webhooksRouter };

/**********************************
 * Stripe routes
 **********************************/
const stripeRouter = Router();

stripeRouter
    .get('/config', authenticate, asyncHandler(stripeController.getConfig))
    .get('/setup-intent', authenticate, asyncHandler(stripeController.setupIntent))
    .get('/payment-methods', authenticate, asyncHandler(stripeController.getCardPaymentMethods))
    .post('/payment-intent', authenticate, asyncHandler(stripeController.createPayment))
    .delete('/payment-methods/:id', authenticate, asyncHandler(stripeController.removePaymentMethod));

/**********************************
 * Momo routes
 **********************************/
const momoRouter = Router();

momoRouter
    .get('/config', authenticate, asyncHandler(momoController.getConfig))
    .get('/verify-payment/:ref', authenticate, asyncHandler(momoController.verifyMomoPayment))
    .get('/payment-methods', authenticate, asyncHandler(momoController.getMomoPaymentMethods))
    .post('/setup-payment-method', authenticate, asyncHandler(momoController.setupMomoPaymentMethod))
    .post('/create-payment-method', authenticate, asyncHandler(momoController.createMomoPaymentMethod))
    .delete('/payment-methods/:id', authenticate, asyncHandler(momoController.removeMomoPaymentMethod))
    .post('/create-payment', authenticate, asyncHandler(momoController.createMomoPayment))
    .post('/submit-otp', authenticate, asyncHandler(momoController.submitMomoPaymentOTP))

/**********************************
 * Paypal routes
 **********************************/
const paypalRouter = Router();

paypalRouter
    .get('/success/:type', asyncHandler(paypalController.successHandler))
    .get('/cancel', asyncHandler(paypalController.cancelHandler))
    .get('/payment-methods', authenticate, asyncHandler(paypalController.getPaymentMethods))
    .get('/capture-payment/:id', authenticate, asyncHandler(paypalController.capturePayment))
    .post('/create-payment', authenticate, asyncHandler(paypalController.createPayment))
    .post('/setup-token', authenticate, asyncHandler(paypalController.setupToken))
    .post('/payment-token', authenticate, asyncHandler(paypalController.paymentToken))
    .delete('/payment-methods/:id', authenticate, asyncHandler(paypalController.removePaymentMethod))


/**********************************
 * Wallet routes
 **********************************/
const walletRouter = Router();

walletRouter.get('/', authenticate, asyncHandler(walletController.getBalance));

/**********************************
 * App routes
 **********************************/
const appRouter = Router();

appRouter.use('/stripe', stripeRouter);
appRouter.use('/momo', momoRouter);
appRouter.use('/paypal', paypalRouter);
appRouter.use('/wallet', walletRouter);

/**********************************
 * Initialize routes
 **********************************/
export function initializeRoutes (app: Application) {
    app.use('/payments', appRouter);
}