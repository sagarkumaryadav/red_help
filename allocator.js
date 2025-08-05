require('dotenv').config();
const { parseWeights, capAndRedistribute } = require('./utils');
const { buildJustification } = require('./justifier');

async function allocateDiscount(totalKitty, agents) {
  const weights = parseWeights(process.env.PARAM_WEIGHTS);
  const basePercent = parseFloat(process.env.BASE_PERCENT);
  const capPercent = parseFloat(process.env.MAX_AGENT_CAP_PERCENT);
  const allowLeftover = process.env.ALLOW_LEFTOVER === 'true';

  const capLimit = totalKitty * capPercent;
  const baseAmount = totalKitty * basePercent;
  const bonusAmount = totalKitty - baseAmount;
  const numAgents = agents.length;

  const perAgentBase = baseAmount / numAgents;

  // Step 1: Calculate totals for each parameter
  const totalPerParam = {};
  for (const param in weights) {
    totalPerParam[param] = agents.reduce((sum, a) => sum + a[param], 0);
  }

  // Step 2: Calculate bonus per agent by distributing each parameter weight
  const bonuses = agents.map(agent => {
    let totalBonus = 0;
    for (const param in weights) {
      const pool = bonusAmount * weights[param];
      const total = totalPerParam[param];
      const fraction = total === 0 ? 0 : agent[param] / total;
      totalBonus += fraction * pool;
    }
    return totalBonus;
  });

  // Step 3: Combine base + bonus and build justification
  const initialAllocations = await Promise.all(
    agents.map(async (agent, i) => {
      const total = Number((perAgentBase + bonuses[i]).toFixed(4));

      const justification = await buildJustification(agent, weights, totalKitty, total);

      return {
        id: agent.id,
        assignedDiscount: total,
        justification
      };
    })
  );



  // Step 4: Apply cap and redistribute
  return capAndRedistribute(initialAllocations, capLimit, allowLeftover, totalKitty);
}

module.exports = { allocateDiscount };
