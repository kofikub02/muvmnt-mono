import Stripe from "stripe";

export async function stripeWebhookEventsHandler(data: any) {
    const event = data as Stripe.Event;

    switch (event.type) {
        case 'payment_intent.succeeded':
            // Handle successful payment intent
            console.log('Payment succeeded:', event.data.object);
            break;
        case 'payment_intent.payment_failed':
            // Handle failed payment intent
            console.log('Payment failed:', event.data.object);
            break;
        case 'account.updated':
            await handleAccountUpdated(event.data.object);
            break
        case 'payout.created':
            break
        case 'payout.updated':
            break
        case 'payout.paid':
            break
        case 'payout.failed':
            break
        // Add more event handlers as needed
        default:
            console.log('Unhandled event type:', event.type);
    }
} 

export async function paystackWebhookEventsHandler(data: any) {
    
}

async function handleAccountUpdated(account: Stripe.Account) {
    console.log('Account Updated', account.id, account.email);
    const stripeAccountId = account.id;
    const data = {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
    }
    // await updateAccountByStripeAccountId(stripeAccountId, data);
}