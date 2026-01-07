"use client";

import { useState } from "react";
import type { Transaction, MonthlyBalance } from "@/types";
import AIInsightsModal from "./AIInsightsModal";

type SummaryCardsProps = {
  weeklyTransactions: Transaction[];
  monthlyTransactions: Transaction[];
  view?: "weekly" | "monthly";
  userId: string;
  monthlyBalance?: MonthlyBalance | null;
};

export default function SummaryCards({
  weeklyTransactions,
  monthlyTransactions,
  view = "monthly",
  userId,
  monthlyBalance,
}: SummaryCardsProps) {
  const [showAIInsights, setShowAIInsights] = useState(false);

  const calculateSummary = (transactions: Transaction[]) => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return {
      income,
      expenses,
      net: income - expenses,
    };
  };

  const currentPeriodTransactions =
    view === "weekly" ? weeklyTransactions : monthlyTransactions;
  const summary = calculateSummary(currentPeriodTransactions);

  // Use monthly balance data if available and view is monthly
  const showBalanceCarryover = view === "monthly" && monthlyBalance;
  const openingBalance = showBalanceCarryover ? monthlyBalance.opening_balance : 0;
  const income = showBalanceCarryover ? monthlyBalance.total_income : summary.income;
  const expenses = showBalanceCarryover ? monthlyBalance.total_expenses : summary.expenses;
  const closingBalance = showBalanceCarryover ? monthlyBalance.closing_balance : summary.net;

  const absoluteValue = Math.abs(closingBalance);
  const periodLabel = view === "weekly" ? "This Week" : "This Month";

  return (
    <>
      <div className={`grid grid-cols-1 gap-6 ${showBalanceCarryover ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {showBalanceCarryover && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Opening Balance
                </p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    openingBalance >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${openingBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <span className="text-2xl">🏦</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${income.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expenses
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                ${expenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {showBalanceCarryover ? "Closing Balance" : "Net"}
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  closingBalance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {showBalanceCarryover ? "" : closingBalance >= 0 ? "+" : "-"}$
                {absoluteValue.toFixed(2)}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                closingBalance >= 0
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <span className="text-2xl">
                {closingBalance >= 0 ? "💰" : "⚠️"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Get AI-Powered Insights
            </h3>
            <p className="text-blue-100">
              Analyze your spending habits and get personalized recommendations
            </p>
          </div>
          <button
            onClick={() => setShowAIInsights(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Insights
          </button>
        </div>
      </div>

      {showAIInsights && (
        <AIInsightsModal
          userId={userId}
          onClose={() => setShowAIInsights(false)}
        />
      )}
    </>
  );
}
