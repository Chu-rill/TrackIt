import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Auth error in GET:", authError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("✅ GET monthly-balances - User:", user.id, user.email);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const periodStart = searchParams.get("period_start");

    if (!periodStart) {
      return NextResponse.json(
        { error: "period_start is required" },
        { status: 400 }
      );
    }

    console.log("📅 Fetching balance for period:", periodStart);

    // Calculate and get monthly balance
    const balance = await calculateMonthlyBalance(supabase, user.id, periodStart);

    console.log("✅ Returning balance:", balance);
    return NextResponse.json(balance);
  } catch (error) {
    console.error("❌ Error in monthly-balances GET API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

async function calculateMonthlyBalance(
  supabase: any,
  userId: string,
  periodStartStr: string
) {
  // Parse date string manually to avoid timezone issues
  // "2025-12-01" should stay as December, not shift to November
  const [year, month, day] = periodStartStr.split("-").map(Number);
  const periodStart = new Date(year, month - 1, day); // month is 0-indexed

  const periodEnd = new Date(
    periodStart.getFullYear(),
    periodStart.getMonth() + 1,
    0
  ); // Last day of month

  // Get the previous month's closing balance
  const previousMonthStart = new Date(
    periodStart.getFullYear(),
    periodStart.getMonth() - 1,
    1
  );

  console.log("📅 Period:", periodStart.toDateString(), "to", periodEnd.toDateString());

  // Format previousMonthStart as YYYY-MM-DD
  const prevMonthKey = `${previousMonthStart.getFullYear()}-${String(previousMonthStart.getMonth() + 1).padStart(2, '0')}-01`;
  console.log("🔍 Looking for previous month balance:", prevMonthKey);

  const { data: previousBalance, error: prevBalanceError } = await supabase
    .from("monthly_balances")
    .select("closing_balance")
    .eq("user_id", userId)
    .eq("period_start", prevMonthKey)
    .maybeSingle();

  if (prevBalanceError) {
    console.error("Error fetching previous balance:", prevBalanceError);
  } else {
    console.log("📊 Previous month closing balance:", previousBalance?.closing_balance || 0);
  }

  const openingBalance = previousBalance?.closing_balance
    ? parseFloat(previousBalance.closing_balance.toString())
    : 0;

  // Get transactions for the current period
  // Format dates as YYYY-MM-DD without timezone conversion
  const periodStartKey = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}-01`;
  const periodEndKey = `${periodEnd.getFullYear()}-${String(periodEnd.getMonth() + 1).padStart(2, '0')}-${String(periodEnd.getDate()).padStart(2, '0')}`;

  console.log("📊 Fetching transactions from", periodStartKey, "to", periodEndKey);
  const { data: transactions, error: transError } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .gte("date", periodStartKey)
    .lte("date", periodEndKey);

  if (transError) {
    console.error("❌ Error fetching transactions:", transError);
    throw transError;
  }

  console.log("📊 Found", transactions?.length || 0, "transactions for this period");

  // Calculate income and expenses
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions?.forEach((t: { type: string; amount: number }) => {
    const amount = parseFloat(t.amount.toString());
    if (t.type === "income") {
      totalIncome += amount;
    } else if (t.type === "expense") {
      totalExpenses += amount;
    }
  });

  console.log("💰 Period totals - Income:", totalIncome, "Expenses:", totalExpenses, "Opening:", openingBalance);

  const closingBalance = openingBalance + totalIncome - totalExpenses;

  // Upsert the monthly balance record
  const balanceRecord = {
    user_id: userId,
    period_start: periodStartKey,
    period_end: periodEndKey,
    opening_balance: openingBalance,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    closing_balance: closingBalance,
  };

  console.log("💾 Upserting balance record:", balanceRecord);

  const { error: upsertError } = await supabase
    .from("monthly_balances")
    .upsert(balanceRecord, {
      onConflict: "user_id,period_start",
    });

  if (upsertError) {
    console.error("❌ Upsert error:", upsertError);
    throw upsertError;
  }

  console.log("✅ Successfully upserted balance for", periodStartKey);

  return {
    period_start: periodStartKey,
    period_end: periodEndKey,
    opening_balance: openingBalance,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    closing_balance: closingBalance,
  };
}

// POST endpoint to recalculate all monthly balances for a user
export async function POST(request: NextRequest) {
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

    // Get all transactions for the user
    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select("date, type, amount")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (transError) {
      throw transError;
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ message: "No transactions found", balances: [] });
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
      const date = new Date(t.date);
      const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const key = periodStart.toISOString().split("T")[0];

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

    // Calculate balances chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    const balances = [];
    let runningBalance = 0;

    for (const monthKey of sortedMonths) {
      const month = monthlyData[monthKey];
      const openingBalance = runningBalance;
      const closingBalance = openingBalance + month.income - month.expenses;

      balances.push({
        user_id: user.id,
        period_start: month.periodStart.toISOString().split("T")[0],
        period_end: month.periodEnd.toISOString().split("T")[0],
        opening_balance: openingBalance,
        total_income: month.income,
        total_expenses: month.expenses,
        closing_balance: closingBalance,
      });

      runningBalance = closingBalance;
    }

    // Delete existing balances and insert new ones
    await supabase
      .from("monthly_balances")
      .delete()
      .eq("user_id", user.id);

    if (balances.length > 0) {
      const { error: insertError } = await supabase
        .from("monthly_balances")
        .insert(balances);

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({
      message: "Balances recalculated successfully",
      balances,
    });
  } catch (error) {
    console.error("Error in monthly-balances POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
