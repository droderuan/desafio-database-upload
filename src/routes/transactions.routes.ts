import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import csv from 'csv-parse';
import fs from 'fs';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ id });

  response.json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    // const createTransaction = new CreateTransactionService();
    const importTransaction = new ImportTransactionsService();
    const inputTransactions = await importTransaction.execute(file.path);

    // inputTransactions.pop();
    // const transactions = await Promise.all(
    //   inputTransactions.map(async input => {
    //     const splited = input.split(', ');
    //     console.log(splited);

    //     const title = splited[0];
    //     const category = splited[3];
    //     const type = splited[1] === 'income' ? 'income' : 'outcome';
    //     const value = Number(splited[2]);

    //     const transaction = await createTransaction.execute({
    //       title,
    //       category,
    //       type,
    //       value,
    //     });

    // //     return transaction;
    //   }),
    // );

    return response.json(inputTransactions);
  },
);

export default transactionsRouter;
