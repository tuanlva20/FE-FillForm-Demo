import axios from 'utils/axios';

export const paymentsAPI = {
  async getBalance(): Promise<number> {
    const res = await axios.get('/api/payments/balance');
    // BE response format: { status: "OK", content: number }
    const balance = res.data?.content;

    if (typeof balance !== 'number') {
      throw new Error(`Invalid balance response: ${JSON.stringify(res.data)}`);
    }

    return balance;
  },

  async refreshBalance(): Promise<void> {
    await axios.post('/api/payments/balance/refresh');
  }
};
