export interface SQLQueryResult {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  executionTimeMs: number;
  message?: string;
  queryPlan?: string;
}

export function executeSQLPlayground(query: string, databaseName: string = "sales"): SQLQueryResult {
  const startTime = Date.now();
  const cleanQuery = query.trim().toUpperCase();

  // Simulated relational datasets for interactive SQL practice
  if (databaseName === "sales" || cleanQuery.includes("ORDERS") || cleanQuery.includes("CUSTOMERS")) {
    if (cleanQuery.includes("WINDOW") || cleanQuery.includes("OVER") || cleanQuery.includes("RANK")) {
      return {
        columns: ["customer_id", "order_date", "total_amount", "running_ltv", "customer_rank"],
        rows: [
          { customer_id: "CUST-101", order_date: "2026-01-15", total_amount: 1450.00, running_ltv: 1450.00, customer_rank: 1 },
          { customer_id: "CUST-101", order_date: "2026-02-10", total_amount: 2890.50, running_ltv: 4340.50, customer_rank: 1 },
          { customer_id: "CUST-204", order_date: "2026-01-18", total_amount: 3200.00, running_ltv: 3200.00, customer_rank: 2 },
          { customer_id: "CUST-309", order_date: "2026-02-01", total_amount: 980.00, running_ltv: 980.00, customer_rank: 3 }
        ],
        rowCount: 4,
        executionTimeMs: 14,
        queryPlan: "WindowAgg -> Sort (customer_id, order_date) -> Index Scan using idx_orders_cust_date"
      };
    }

    return {
      columns: ["order_id", "customer_name", "region", "product_category", "sales_usd", "profit_margin_pct"],
      rows: [
        { order_id: "ORD-9401", customer_name: "Acme Enterprise", region: "North America", product_category: "Cloud Compute", sales_usd: 12500, profit_margin_pct: 38.5 },
        { order_id: "ORD-9402", customer_name: "FinTech Global", region: "Europe", product_category: "Vector Database", sales_usd: 8400, profit_margin_pct: 42.0 },
        { order_id: "ORD-9403", customer_name: "BioHealth Inc", region: "North America", product_category: "Medical AI Vision", sales_usd: 24000, profit_margin_pct: 45.2 },
        { order_id: "ORD-9404", customer_name: "Quantum Logistics", region: "Asia Pacific", product_category: "Route Optimization", sales_usd: 16800, profit_margin_pct: 31.0 }
      ],
      rowCount: 4,
      executionTimeMs: 9,
      queryPlan: "Index Scan on orders_pk (cost=0.15..12.40 rows=4 width=84)"
    };
  }

  // Default fallback schema
  return {
    columns: ["id", "title", "status", "created_at"],
    rows: [
      { id: "1", title: "ML Pipeline Training Record", status: "completed", created_at: "2026-03-01 10:00:00" },
      { id: "2", title: "Model Evaluation Checkpoint", status: "verified", created_at: "2026-03-01 11:30:00" }
    ],
    rowCount: 2,
    executionTimeMs: Date.now() - startTime + 5
  };
}
