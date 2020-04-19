import { getCustomRepository } from 'typeorm';

// import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transaction = await transactionRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction do not exist', 400);
    }

    transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
