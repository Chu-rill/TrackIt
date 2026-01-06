import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Transaction, AIInsight } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transactions, period } = await request.json()

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        {
          insights: {
            summary: `You haven't recorded any transactions for this ${period} period yet. Start tracking your income and expenses to get personalized insights!`,
            strengths: [],
            improvements: ['Start tracking your transactions to build better financial habits'],
            recommendations: ['Log every transaction, no matter how small', 'Categorize your expenses accurately', 'Review your spending regularly'],
          },
        },
        { status: 200 }
      )
    }

    // Calculate totals
    const totalIncome = transactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount.toString()), 0)

    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount.toString()), 0)

    // Group by category
    const expensesByCategory: { [key: string]: number } = {}
    transactions
      .filter((t: Transaction) => t.type === 'expense')
      .forEach((t: Transaction) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount.toString())
      })

    const prompt = `You are a financial advisor analyzing someone's ${period} spending habits. Here's their financial data:

Total Income: $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Net Amount: $${(totalIncome - totalExpenses).toFixed(2)}

Expenses by Category:
${Object.entries(expensesByCategory)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)} (${((amount / totalExpenses) * 100).toFixed(1)}%)`)
  .join('\n')}

Number of Transactions: ${transactions.length}

Please provide:
1. A brief summary of their financial situation (2-3 sentences)
2. 2-3 strengths in their spending habits
3. 2-3 areas for improvement
4. 3-4 specific, actionable recommendations

Format your response as JSON with this structure:
{
  "summary": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"]
}

Be encouraging but honest. Focus on practical advice.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const insights: AIInsight = JSON.parse(content.text)

    return NextResponse.json({ insights })
  } catch (error: any) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
