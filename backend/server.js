import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import expenseRoutes from "./routes/expenseRoutes.js"
import budgetRoutes from "./routes/budgetRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API Running" })
})

app.use("/api/expenses", expenseRoutes)
app.use("/api/budget", budgetRoutes)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running")
    })
  })
  .catch((err) => {
    console.log(err.message)
  })
