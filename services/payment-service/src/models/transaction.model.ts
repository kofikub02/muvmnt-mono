import { Schema, Document, model } from 'mongoose';
import { ITransaction } from '../entities/transaction';

interface TransactionDocument extends ITransaction, Document {}

const TransactionSchema = new Schema<TransactionDocument>(
    {
        uid: { type: String, required: true },
        reference: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        entity: { type: String, required: true },
        entity_id: { type: String, required: true },
        type: {
            type: String,
            enum: ['payment', 'payout', 'refund', 'credit'],
            required: true,
        },
        payment_gateway: {
            type: String,
            enum: ['stripe', 'momo', 'paypal', 'credit'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'cancelled'],
            required: true,
            default: 'pending'
        },
        payment_method_id: { type: String },
    },
    {
        timestamps: true,
    }
);

const TransactionModel = model<TransactionDocument>('Transaction', TransactionSchema);

export { TransactionModel, TransactionDocument }