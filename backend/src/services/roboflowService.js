import fs from 'fs';
import axios from 'axios';
import { withRetry, createCircuitBreaker } from '../utils/retry.js';

const breaker = createCircuitBreaker({ threshold: 5, cooldownMs: 60_000 });

const extractPredictions = (raw) => {
  if (Array.isArray(raw?.outputs)) {
    for (const output of raw.outputs) {
      if (Array.isArray(output?.predictions?.predictions)) return output.predictions.predictions;
      if (Array.isArray(output?.predictions)) return output.predictions;
    }
  }
  if (Array.isArray(raw?.predictions)) return raw.predictions;
  return [];
};

const analyzeWithRoboflow = async (imagePath) => {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const workflowUrl = process.env.ROBOFLOW_URL;

  if (!apiKey) throw new Error('ROBOFLOW_API_KEY is not configured');
  if (!workflowUrl) throw new Error('ROBOFLOW_URL is not configured');

  if (breaker.isOpen()) {
    throw new Error('Roboflow service is temporarily unavailable (circuit open)');
  }

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  let response;
  try {
    response = await withRetry(
      () => axios.post(
        workflowUrl,
        { api_key: apiKey, inputs: { image: { type: 'base64', value: base64Image } } },
        { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
      ),
      { retries: 1, baseDelayMs: 1000 }
    );
    breaker.recordSuccess();
  } catch (err) {
    breaker.recordFailure();
    const status = err.response?.status;
    const detail = err.response?.data?.message || err.message;
    throw new Error(`Roboflow error${status ? ` (${status})` : ''}: ${detail}`);
  }

  const raw = response.data;
  const predictions = extractPredictions(raw);

  if (!predictions || predictions.length === 0) {
    console.log('[Roboflow] No predictions — returning Unknown');
    return { diseaseLabel: 'Unknown', confidence: 0, raw };
  }

  const top = predictions.reduce((a, b) => (a.confidence > b.confidence ? a : b));
  return {
    diseaseLabel: top.class || top.class_name || 'Unknown',
    confidence: Math.round((top.confidence || 0) * 100),
    raw,
  };
};

export default analyzeWithRoboflow;
