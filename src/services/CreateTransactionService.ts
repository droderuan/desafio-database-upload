import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const checkedCategory = await this.checkOrCreateCategory(category);

    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid operation', 400);
    }

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insuficient amount', 400);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: checkedCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }

  private async checkOrCreateCategory(category: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);

      return newCategory;
    }
    return checkCategory;
  }
}

export default CreateTransactionService;
