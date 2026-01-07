"use client";

import { useEffect, useState } from "react";
import type { MonthlyBalance } from "@/types";

type BalanceHistoryProps = {
  userId: string;
  refreshKey?: number;
};

export default function BalanceHistory({ userId, refreshKey = 0 }: BalanceHistoryProps) {
  const [balances, setBalances] = useState<MonthlyBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalanceHistory = async () => {
      try {
        setLoading(true);
        console.log("📊 Fetching balance history from database...");

        // Import Supabase client
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data, error } = await supabase
          .from("monthly_balances")
          .select("*")
          .eq("user_id", userId)
          .order("period_start", { ascending: true });

        if (error) {
          console.error("Error fetching balances:", error);
          setBalances([]);
        } else {
          console.log("📊 Balance history received:", data);
          setBalances(data || []);
        }
      } catch (error) {
        console.error("Error fetching balance history:", error);
        setBalances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceHistory();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Balance History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Balance History</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No balance history available yet. Start by adding some transactions!
        </p>
      </div>
    );
  }

  const maxBalance = Math.max(
    ...balances.map((b) =>
      Math.max(Math.abs(b.opening_balance), Math.abs(b.closing_balance))
    )
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Balance History</h3>

      <div className="space-y-4">
        {balances.map((balance, index) => {
          // Parse date properly to avoid timezone issues
          // "2025-12-01" should be December, not shifted to November
          const [year, month, day] = balance.period_start.split("-").map(Number);
          const periodDate = new Date(year, month - 1, day); // month is 0-indexed
          const monthYear = periodDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });

          const openingWidth =
            maxBalance > 0
              ? (Math.abs(balance.opening_balance) / maxBalance) * 100
              : 0;
          const closingWidth =
            maxBalance > 0
              ? (Math.abs(balance.closing_balance) / maxBalance) * 100
              : 0;

          return (
            <div key={balance.id || index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{monthYear}</span>
                <div className="flex gap-4 text-sm">
                  <span
                    className={
                      balance.closing_balance >= balance.opening_balance
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {balance.closing_balance >= balance.opening_balance
                      ? "+"
                      : ""}
                    $
                    {(
                      balance.closing_balance - balance.opening_balance
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                    Opening
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full ${
                        balance.opening_balance >= 0
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${openingWidth}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium w-20 text-right">
                    ${balance.opening_balance.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                    Closing
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full ${
                        balance.closing_balance >= 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${closingWidth}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium w-20 text-right">
                    ${balance.closing_balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Income: ${balance.total_income.toFixed(2)}</span>
                <span>Expenses: ${balance.total_expenses.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
