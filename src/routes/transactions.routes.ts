import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transictionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transictionsRepository.find({
    relations: ['category'],
  });

  const balance = await transictionsRepository.getBalance();

  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category_title: category,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id as string);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  multer({ dest: 'tmp' }).single('file'),
  async (request, response) => {
    const { file } = request;

    const importTransactions = new ImportTransactionsService();

    const importedTransactions = await importTransactions.execute(file);

    return response.status(200).send(importedTransactions);
  },
);

export default transactionsRouter;
