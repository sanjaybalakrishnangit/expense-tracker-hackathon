import express from "express"
import Expense from "../models/Expense.js"

const router = express.Router()

router.post("/", async (req, res) => {
  const { amount, category, note, date } = req.body

  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" })
  if (!category) return res.status(400).json({ message: "Category required" })
  if (!date) return res.status(400).json({ message: "Date required" })

  const expense = await Expense.create({
    amount,
    category,
    note: note || "",
    date,
  })

  res.status(201).json(expense)
})

router.get("/", async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 })
  res.json(expenses)
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { amount, category, note, date } = req.body

  const updated = await Expense.findByIdAndUpdate(
    id,
    { amount, category, note, date },
    { new: true }
  )

  if (!updated) return res.status(404).json({ message: "Expense not found" })

  res.json(updated)
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const deleted = await Expense.findByIdAndDelete(id)
  if (!deleted) return res.status(404).json({ message: "Expense not found" })

  res.json({ message: "Deleted" })
})

export default router
