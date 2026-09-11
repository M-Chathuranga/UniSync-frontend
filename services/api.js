const BASE_URL = 'http://192.168.8.100:5000/api'; // ඔයාගේ backend IP එක සහ port එක

export const api = {
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  getTransactions: async () => {
    const res = await fetch(`${BASE_URL}/transactions`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },

  addTransaction: async (data) => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },
};