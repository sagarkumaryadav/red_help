

function parseWeights(envString) {
  const entries = envString.split(',').map(s => s.split(':'));
  const weights = {};
  for (const [key, val] of entries) {
    weights[key.trim()] = parseFloat(val);
  }
  return weights;
}

function capAndRedistribute(allocations, capLimit, allowLeftover, totalKitty) {
  let final = [];
  let excess = 0;

  // Step 1: Enforce cap
  allocations.forEach(agent => {
    if (agent.assignedDiscount > capLimit) {
      excess += agent.assignedDiscount - capLimit;
      final.push({
        ...agent,
        assignedDiscount: capLimit,
        justification: agent.justification + ' (capped)'
      });
    } else {
      final.push({ ...agent });
    }
  });

  // Step 2: Redistribute if allowed and needed
  if (!allowLeftover && excess > 0) {
    let eligible = final.filter(a => a.assignedDiscount < capLimit);
    let eligibleTotal = eligible.reduce((acc, a) => acc + a.assignedDiscount, 0);

    if (eligible.length > 0 && eligibleTotal > 0) {
      for (let agent of final) {
        if (agent.assignedDiscount >= capLimit) continue;

        const proportion = agent.assignedDiscount / eligibleTotal;
        const extra = proportion * excess;

        const maxAssignable = capLimit - agent.assignedDiscount;
        const actualExtra = Math.min(extra, maxAssignable);

        agent.assignedDiscount += actualExtra;
        excess -= actualExtra;
      }

    }
  }

  // Final clamp to avoid over-budget
  const totalAllocated = final.reduce((sum, a) => sum + a.assignedDiscount, 0);
  if (totalAllocated > totalKitty) {
    const scale = totalKitty / totalAllocated;
    final = final.map(a => ({
      ...a,
      assignedDiscount: Math.floor(a.assignedDiscount * scale)
    }));
  }

  // Ensure no null/NaN/undefined
  for (const agent of final) {
    if (!isFinite(agent.assignedDiscount) || agent.assignedDiscount == null) {
      agent.assignedDiscount = 0;
    }
  }



  return final;
}


module.exports = { parseWeights, capAndRedistribute };
