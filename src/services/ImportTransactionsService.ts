import fs from 'fs';
import csvParser from 'csv-parse';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    const { path } = file;

    const parseStream = csvParser({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const csvReadStream = fs.createReadStream(path);
    const parseCSV = csvReadStream.pipe(parseStream);
    const transactions: Array<Transaction> = [];
    const createTransaction = new CreateTransactionService();

    // eslint-disable-next-line no-restricted-syntax
    for await (const line of parseCSV) {
      const [title, type, value, category_title] = line;

      if (title && type && value) {
        const transaction = await createTransaction.execute({
          title,
          type,
          value,
          category_title,
        });

        transactions.push(transaction);
      }
    }

    parseCSV.on('error', function (err) {
      console.error(err.message);
    });

    await fs.promises.unlink(path);

    return transactions;
  }
}

export default ImportTransactionsService;
