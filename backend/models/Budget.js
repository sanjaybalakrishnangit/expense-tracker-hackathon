import mongoose from "mongoose"

const budgetSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
  },
  { timestamps: true }
)

export default mongoose.model("Budget", budgetSchema)
