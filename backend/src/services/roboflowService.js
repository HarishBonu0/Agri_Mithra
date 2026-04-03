import fs from 'fs';
import axios from 'axios';

const analyzeWithRoboflow = async (imagePath) => {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const workflowUrl = process.env.ROBOFLOW_URL;

  if (!apiKey) throw new Error('ROBOFLOW_API_KEY is not configured');
  if (!workflowUrl) throw new Error('ROBOFLOW_URL is not configured');

  const base64Image = fs.readFileSync(imagePath).toString('base64');

  const response = await axios.post(
    workflowUrl,
    { api_key: apiKey, inputs: { image: { type: 'base64', value: base64Image } } },
    { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
  );

  // Direct extraction: outputs[0].predictions[0].class
  let disease = 'Leaf infection';
  try {
    const pred = response.data?.outputs?.[0]?.predictions?.[0];
    if (pred?.class && typeof pred.class === 'string' && pred.class.trim()) {
      disease = pred.class.trim();
    }
  } catch {
    // use fallback
  }

  console.log(`[Roboflow] Detected: "${disease}"`);
  return { disease };
};

export default analyzeWithRoboflow;
