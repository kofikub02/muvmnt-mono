import logger from "../lib/logger";
import { TransactionDocument, TransactionModel } from "../models/transaction.model";
import { BaseMongoDBRepository } from "@repo/lib";

export class TransactionsRepository extends BaseMongoDBRepository<TransactionDocument, typeof TransactionModel> {
  constructor() {
    super(TransactionModel);
  }

  async postTransaction(data: Partial<TransactionDocument>): Promise<void> {
    try {
      let transaction = await this.findOneByAttr({ reference: data.reference! });
      if (!transaction) {
        transaction = await this.create(data);
      } else {
        await this.update(transaction.id, data);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
