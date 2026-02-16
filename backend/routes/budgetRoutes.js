import express from "express"
import Budget from "../models/Budget.js"

const router = express.Router()

router.get("/", async (req, res) => {
  const budget = await Budget.findOne().sort({ createdAt: -1 })
  res.json(budget || { amount: 0 })
})

router.post("/", async (req, res) => {
  const { amount } = req.body

  const num = Number(amount)
  if (!num || num <= 0) return res.status(400).json({ message: "Invalid budget amount" })

  const budget = await Budget.create({ amount: num })
  res.status(201).json(budget)
})

export default router
