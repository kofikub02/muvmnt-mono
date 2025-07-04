import { Request, Response } from "express";
import { successResponse, STATUS_CODES } from "@repo/lib";
import { ActorsRepository } from "../repository/actors.repository";
import { sendNotification } from "../producers/send-notification";
import { TransactionsRepository } from "../repository/transactions.repository";

export class WalletController {
    private actorRepository: ActorsRepository;
    private transactionRepository: TransactionsRepository;
    
    constructor(actorsRepo: ActorsRepository, transactionsRepo: TransactionsRepository) {
        this.actorRepository = actorsRepo;
        this.transactionRepository = transactionsRepo;
    }
        
    getBalance = async (req: Request, res: Response) => {
        const { uid } = req.user;

        let actor = await this.actorRepository.findOneByAttr({ uid });
        if (!actor) {
            actor = await this.actorRepository.create({ uid });
        }

        const { credits } = actor;
        res.status(STATUS_CODES.OK).send(successResponse({ credits }));
    }
}