import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔧 Initializing balances for user:", user.id);
    console.log("🔧 User email:", user.email);

    // Get all transactions for the user
    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select("date, type, amount")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (transError) {
      console.error("Error fetching transactions:", transError);
      return NextResponse.json(
        { error: "Failed to fetch transactions", details: transError },
        { status: 500 }
      );
    }

    console.log("📊 Found", transactions?.length || 0, "transactions");

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        message: "No transactions found",
        balances: []
      });
    }

    // Group transactions by month
    const monthlyData: {
      [key: string]: {
        periodStart: Date;
        periodEnd: Date;
        income: number;
        expenses: number;
      };
    } = {};

    transactions.forEach((t) => {
      // Parse date manually to avoid timezone issues
      const [year, month, day] = t.date.split("-").map(Number);
      const periodStart = new Date(year, month - 1, 1); // month is 0-indexed
      const periodEnd = new Date(year, month, 0); // Last day of the month

      // Create key as YYYY-MM-01 format
      const key = `${year}-${String(month).padStart(2, '0')}-01`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          periodStart,
          periodEnd,
          income: 0,
          expenses: 0,
        };
      }

      const amount = parseFloat(t.amount.toString());
      if (t.type === "income") {
        monthlyData[key].income += amount;
      } else if (t.type === "expense") {
        monthlyData[key].expenses += amount;
      }
    });

    console.log("📅 Found data for", Object.keys(monthlyData).length, "months");

    // Calculate balances chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    const balances = [];
    let runningBalance = 0;

    for (const monthKey of sortedMonths) {
      const month = monthlyData[monthKey];
      const openingBalance = runningBalance;
      const closingBalance = openingBalance + month.income - month.expenses;

      // Format dates as YYYY-MM-DD without timezone conversion
      const periodStartKey = `${month.periodStart.getFullYear()}-${String(month.periodStart.getMonth() + 1).padStart(2, '0')}-01`;
      const periodEndKey = `${month.periodEnd.getFullYear()}-${String(month.periodEnd.getMonth() + 1).padStart(2, '0')}-${String(month.periodEnd.getDate()).padStart(2, '0')}`;

      const balanceRecord = {
        user_id: user.id,
        period_start: periodStartKey,
        period_end: periodEndKey,
        opening_balance: openingBalance,
        total_income: month.income,
        total_expenses: month.expenses,
        closing_balance: closingBalance,
      };

      balances.push(balanceRecord);
      runningBalance = closingBalance;

      console.log("💰", periodStartKey, "→ Opening:", openingBalance, "Closing:", closingBalance);
    }

    // Delete existing balances first
    console.log("🗑️ Clearing existing balances...");
    const { error: deleteError } = await supabase
      .from("monthly_balances")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to clear existing balances", details: deleteError },
        { status: 500 }
      );
    }

    // Insert new balances
    console.log("💾 Inserting", balances.length, "balance records...");
    const { data: insertedData, error: insertError } = await supabase
      .from("monthly_balances")
      .insert(balances)
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to insert balances", details: insertError },
        { status: 500 }
      );
    }

    console.log("✅ Successfully inserted", insertedData?.length || 0, "records");

    return NextResponse.json({
      message: "Balances initialized successfully",
      balances: insertedData,
      count: insertedData?.length || 0,
    });
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
