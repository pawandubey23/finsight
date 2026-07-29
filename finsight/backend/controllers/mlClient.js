const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const client = axios.create({ baseURL: ML_URL, timeout: 4000 });

// Falls back gracefully if the ML microservice is down, so the core app never breaks.

async function categorize(description) {
  try {
    const { data } = await client.post('/categorize', { description });
    return data.category || 'Other';
  } catch (err) {
    return 'Other';
  }
}

async function checkAnomaly(transaction, history) {
  try {
    const { data } = await client.post('/detect-anomaly', {
      transaction,
      history
    });
    return { isAnomaly: !!data.is_anomaly, score: data.score || 0 };
  } catch (err) {
    return { isAnomaly: false, score: 0 };
  }
}

async function forecast(history) {
  try {
    const { data } = await client.post('/forecast', { history });
    return data;
  } catch (err) {
    return { next_month_estimate: null, by_category: {} };
  }
}

async function detectSubscriptions(history) {
  try {
    const { data } = await client.post('/detect-subscriptions', { history });
    return data.subscriptions || [];
  } catch (err) {
    return [];
  }
}

module.exports = { categorize, checkAnomaly, forecast, detectSubscriptions };
