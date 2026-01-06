import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";
import CategoryManager from "@/components/CategoryManager";
import RealtimeStatus from "@/components/RealtimeStatus";
import { initializeUserCategories } from "@/lib/supabase/init-user";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Initialize default categories for new users
  if (user?.id) {
    await initializeUserCategories(supabase, user.id);
  }

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user?.id)
    .order("date", { ascending: false })
    .limit(10);

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user?.id)
    .order("name");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header userEmail={user?.email || ""} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your income and expenses
          </p>
        </div>

        <DashboardClient
          initialTransactions={transactions || []}
          categories={categories || []}
          userId={user?.id || ""}
        />

        <div className="mt-8">
          <CategoryManager initialCategories={categories || []} />
        </div>
      </main>

      <RealtimeStatus />
    </div>
  );
}
