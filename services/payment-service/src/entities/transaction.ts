/**
 * 
 * 
 * 
 */
export interface ITransaction {
    uid: string;
    reference: string
    amount: number;
    currency: string;
    entity: string;
    entity_id: string;
    type: 'payment' | 'payout' | 'refund' | 'credit' | 'wallet';
    payment_gateway: 'stripe' | 'paystack' | 'paypal' | 'credit' | 'wallet';
    status: 'pending'| 'completed' | 'failed' | 'cancelled';
    payment_method_id?: string;
}