require('dotenv').config();
const axios = require('axios');

// Friendly parameter names
const PARAM_LABELS = {
  performanceScore: 'performance',
  targetAchievedPercent: 'target achievement',
  activeClients: 'client engagement',
  seniorityMonths: 'experience'
};

// Template fallback messages
const fallbackTemplates = {
  positive: [
    'Excellent ${p1} and strong ${p2} made a solid impact.',
    'Great ${p1} and good ${p2} helped you stand out.',
    '${p1} and ${p2} were key strengths in this cycle.',
    'Your ${p1} and ${p2} stood above your peers.',
    'Consistently high ${p1} and reliable ${p2} performance paid off.'
  ],
  negative: [
    'Low ${p1} and weak ${p2} impacted your score.',
    'Underperformance in ${p1} and ${p2} led to a lower allocation.',
    '${p1} and ${p2} were below expectations this cycle.',
    'Improving ${p1} and ${p2} can significantly boost your results.',
    'Your ${p1} and ${p2} scores were relatively low compared to peers.'
  ]
};

// Main function
async function buildJustification(agent , weights, totalKitty, agentDiscount) {
  const useGemini = process.env.USE_GEMINI === 'true';
  const threshold = parseFloat(process.env.JUSTIFICATION_THRESHOLD || '0.3');

  const contributions = Object.entries(weights).map(([param, weight]) => ({
    param,
    label: PARAM_LABELS[param],
    weight,
    rawValue: agent[param],
    weightedScore: agent[param] * weight
  }));

  // Sort to determine best/worst parameters
  const sorted = [...contributions].sort((a, b) => b.weightedScore - a.weightedScore);
  const top2 = sorted.slice(0, 2);
  const bottom2 = sorted.slice(-2);
  const isHigh = (agentDiscount / totalKitty) >= threshold;

  const selected = isHigh ? top2 : bottom2;

  if (useGemini) {
    try {
      return await callGeminiAPI(selected, isHigh);
    } catch (err) {
      console.error('[Gemini Error] Falling back to templates:', err.message);
    }
  }

  // Use fallback template
  const templateList = fallbackTemplates[isHigh ? 'positive' : 'negative'];
  const template = templateList[Math.floor(Math.random() * templateList.length)];
  return template
    .replace('${p1}', selected[0].label)
    .replace('${p2}', selected[1].label);
}

// Gemini REST API request using axios
async function callGeminiAPI(params, isHigh) {
  const [p1, p2] = params;
  const prompt = `
Generate a short ${isHigh ? 'praising' : 'motivating'} comment for a sales agent based on these two performance indicators:
1. ${p1.label} (${p1.rawValue})
2. ${p2.label} (${p2.rawValue})

Be concise, professional, and natural. 1–2 sentences only. Don't include inverted commas or quotes.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const message = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//   console.log('Gemini response:', message);
  return message?.trim() || 'Justification not available.';
}

module.exports = { buildJustification };
