import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const totalIncome = transactions
      .filter(item => item.type === 'income')
      .reduce((acc, item) => {
        const amount = acc + parseFloat(item.value.toString());
        return amount;
      }, 0);

    const totalOutcome = transactions
      .filter(item => item.type === 'outcome')
      .reduce((acc, item) => {
        const amount = acc + parseFloat(item.value.toString());
        return amount;
      }, 0);

    const total = totalIncome - totalOutcome;

    return {
      income: totalIncome,
      outcome: totalOutcome,
      total,
    };
  }
}

export default TransactionsRepository;
