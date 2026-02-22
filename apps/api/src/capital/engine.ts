export type CapitalInput = {
  income: any[];
  expenses: any[];
  buckets: any[];
};

export function runCapitalSimulation(input: CapitalInput) {
  const totalIncome = input.income.reduce(
    (sum, i) => sum + Number(i.amount_monthly ?? 0),
    0
  );
  const totalExpenses = input.expenses.reduce(
    (sum, e) => sum + Number(e.amount_monthly ?? 0),
    0
  );
  const surplus = Math.max(0, totalIncome - totalExpenses);

  const totalSavings = input.buckets.reduce(
    (sum, b) => sum + Number(b.current_amount ?? 0),
    0
  );

  const volatility = input.income.some((i) => i.volatility_flag) ? 0.8 : 1.0;
  const runwayMonths = totalExpenses > 0 ? (totalSavings / totalExpenses) * volatility : 0;

  const totalWeight = input.buckets.reduce(
    (sum, b) => sum + Number(b.priority_weight ?? 0),
    0
  );

  const allocations = input.buckets.map((bucket) => {
    const weight = totalWeight > 0 ? bucket.priority_weight / totalWeight : 0;
    let allocation = surplus * weight;

    if (bucket.name?.toLowerCase().includes("emergency") && bucket.current_amount < bucket.target_amount) {
      allocation = Math.max(allocation, surplus * 0.5);
    }

    if (bucket.name?.toLowerCase().includes("speculative")) {
      allocation = Math.min(allocation, surplus * 0.5);
    }

    return {
      bucket_id: bucket.id,
      allocation
    };
  });

  const risk = {
    liquidity_risk: totalSavings < totalExpenses * 3 ? 70 : 30,
    income_volatility_risk: volatility < 1 ? 60 : 20,
    overcommitment_risk: surplus <= 0 ? 80 : 20
  };

  return {
    totalIncome,
    totalExpenses,
    surplus,
    runwayMonths,
    allocations,
    risk
  };
}
