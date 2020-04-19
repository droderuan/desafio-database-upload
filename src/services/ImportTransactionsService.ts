import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const file = fs.readFileSync(path);
    const transactions: RequestDTO[] = await parse(file, {
      columns: ['title', 'type', 'value', 'category'],
      delimiter: ', ',
    });
    transactions.splice(0, 1);

    const inputedTransactions: Transaction[] = [];

    const createTransaction = new CreateTransactionService();
    // const inputedTransactions = await Promise.all(
    //   transactions.map(async transaction => {
    //     const createdTransaction = await createTransaction.execute(transaction);

    //     return createdTransaction;
    //   }),
    // );

    for (const transaction of transactions) {
      const createdTransaction = await createTransaction.execute(transaction);
      inputedTransactions.push(createdTransaction);
    }

    return inputedTransactions;
  }
}

export default ImportTransactionsService;
