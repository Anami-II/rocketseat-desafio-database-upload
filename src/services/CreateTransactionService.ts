import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title?: string;
}

class CreateTransactionService {
  public async execute(request: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);

    const { title, value, type, category_title } = request;

    let category_id;

    if (category_title) {
      const category = await categoriesRepository.findOne({
        where: { title: category_title },
      });

      if (!category) {
        const createCategory = new CreateCategoryService();

        const newCategory = await createCategory.execute({
          title: category_title,
        });

        category_id = newCategory.id;
      } else {
        category_id = category.id;
      }
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (balance.income - value < 0) {
        throw new AppError('Insufficient balance');
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
