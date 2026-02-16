import mongoose from "mongoose"

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    note: { type: String, default: "" },
    date: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model("Expense", expenseSchema)
