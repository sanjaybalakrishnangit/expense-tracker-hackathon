import { useEffect, useMemo, useState } from "react"
import "./App.css"
const EXPENSE_API = "https://expense-tracker-api-kfw6.onrender.com/api/expenses"
const BUDGET_API = "https://expense-tracker-api-kfw6.onrender.com/api/budget"

const CATEGORY_OPTIONS = ["Food", "Travel", "Shopping", "Bills", "Education", "Health", "Other"]

function formatINR(n) {
  const num = Number(n || 0)
  return num.toLocaleString("en-IN", { style: "currency", currency: "INR" })
}

function toISODate(d) {
  const dt = new Date(d)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function App() {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [customCategory, setCustomCategory] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(toISODate(new Date()))

  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState("")
  const [savedBudget, setSavedBudget] = useState(0)

  const [filterCategory, setFilterCategory] = useState("All")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [editingExpense, setEditingExpense] = useState(null)

  useEffect(() => {
  const load = async () => {
    try {
      const [eRes, bRes] = await Promise.all([fetch(EXPENSE_API), fetch(BUDGET_API)])
      const eData = await eRes.json()
      const bData = await bRes.json()

      setExpenses(Array.isArray(eData) ? eData : [])
      setSavedBudget(Number(bData?.amount || 0))
    } catch (err) {
      alert("Backend not reachable. Please start backend server.")
    }
  }

  load()
}, [])

  const finalCategory = customCategory.trim() ? customCategory.trim() : category

 const addExpense = async (e) => {
  e.preventDefault()

  const amt = Number(amount)
  if (!amt || amt <= 0) return alert("Enter a valid amount")
  if (!finalCategory) return alert("Enter a category")
  if (!date) return alert("Select a date")

  try {
    if (editingExpense) {
      const res = await fetch(`${EXPENSE_API}/${editingExpense._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          category: finalCategory,
          note: note.trim(),
          date,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        return alert(err?.message || "Failed to update expense")
      }

      const updated = await res.json()

      setExpenses((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))
      cancelEdit()
      return
    }

    const res = await fetch(EXPENSE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amt,
        category: finalCategory,
        note: note.trim(),
        date,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return alert(err?.message || "Failed to add expense")
    }

    const created = await res.json()
    setExpenses((prev) => [created, ...prev])

    setAmount("")
    setCategory(CATEGORY_OPTIONS[0])
    setCustomCategory("")
    setNote("")
    setDate(toISODate(new Date()))
  } catch {
    alert("Server error")
  }
}


const deleteExpense = async (id) => {
  try {
    const res = await fetch(`${EXPENSE_API}/${id}`, { method: "DELETE" })
    if (!res.ok) return alert("Failed to delete")

    setExpenses((prev) => prev.filter((x) => x._id !== id))
  } catch {
    alert("Server error while deleting")
  }
}

  const clearAll = () => {
    const ok = confirm("Clear all expenses?")
    if (!ok) return
    setExpenses([])
  }

 const saveBudget = async (e) => {
  e.preventDefault()

  const num = Number(budget)
  if (!num || num <= 0) return alert("Enter a valid budget amount")

  try {
    const res = await fetch(BUDGET_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: num }),
    })

    if (!res.ok) {
      const err = await res.json()
      return alert(err?.message || "Failed to save budget")
    }

    const saved = await res.json()
    setSavedBudget(Number(saved.amount || 0))
    setBudget("")
  } catch {
    alert("Server error while saving budget")
  }
}




  const filteredExpenses = useMemo(() => {
    let list = [...expenses]

    if (filterCategory !== "All") {
      list = list.filter((x) => x.category.toLowerCase() === filterCategory.toLowerCase())
    }

    if (fromDate) {
      list = list.filter((x) => x.date >= fromDate)
    }

    if (toDate) {
      list = list.filter((x) => x.date <= toDate)
    }

    return list
  }, [expenses, filterCategory, fromDate, toDate])

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, x) => sum + Number(x.amount || 0), 0)
  }, [expenses])

  const remaining = useMemo(() => {
  return Math.max(0, Number(savedBudget) - Number(totalSpent))
}, [savedBudget, totalSpent])

const isOverBudget = useMemo(() => {
  return savedBudget > 0 && totalSpent > savedBudget
}, [savedBudget, totalSpent])

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, x) => sum + Number(x.amount || 0), 0)
  }, [filteredExpenses])

  const startEdit = (expense) => {
  setEditingExpense(expense)

  setAmount(String(expense.amount))
  setCategory(CATEGORY_OPTIONS.includes(expense.category) ? expense.category : CATEGORY_OPTIONS[0])
  setCustomCategory(CATEGORY_OPTIONS.includes(expense.category) ? "" : expense.category)
  setNote(expense.note || "")
  setDate(expense.date)
}
const cancelEdit = () => {
  setEditingExpense(null)

  setAmount("")
  setCategory(CATEGORY_OPTIONS[0])
  setCustomCategory("")
  setNote("")
  setDate(toISODate(new Date()))
}


  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">
  💰 Expense Tracker
          </h1>

          <p>Single-user expense & budget tracking</p>
        </div>
        <div className="totals">
  <div className="pill">
    <span>Budget</span>
    <b>{savedBudget ? formatINR(savedBudget) : "Not set"}</b>
  </div>

  <div className="pill">
    <span>Total Spent</span>
    <b>{formatINR(totalSpent)}</b>
  </div>

  <div className="pill">
    <span>Remaining</span>
    <b>{savedBudget ? formatINR(remaining) : "-"}</b>
  </div>

  <div className="pill">
    <span>Filtered Total</span>
    <b>{formatINR(filteredTotal)}</b>
  </div>
</div>

      </header>

{isOverBudget && (
  <div className="warning">
    ⚠️ You have exceeded your budget by {formatINR(totalSpent - savedBudget)}
  </div>
)}

      <div className="grid">
        <section className="card">
  <h2>Add Expense</h2>

  <form className="budgetForm" onSubmit={saveBudget}>
    <input
      type="number"
      value={budget}
      onChange={(e) => setBudget(e.target.value)}
      placeholder="Set your budget (e.g. 5000)"
    />
    <button className="btn secondary" type="submit">
      Save Budget
    </button>
  </form>


          <form className="form" onSubmit={addExpense}>
            <div className="row">
              <label>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 250"
              />
            </div>

            <div className="row">
              <label>Category (Preset)</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <label>Custom Category (Optional)</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Snacks"
              />
            </div>

            <div className="row">
              <label>Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Tea + biscuit"
              />
            </div>

            <div className="row">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <button className="btn" type="submit">
              {editingExpense ? "Update Expense" : "Add Expense"}
            </button>
            {editingExpense && (
  <button className="btn secondary" type="button" onClick={cancelEdit}>
    Cancel Edit
  </button>
)}
          </form>
        </section>

        <section className="card">
          <div className="cardTop">
            <h2>Filters</h2>
            <button className="btn danger" onClick={clearAll} disabled={expenses.length === 0}>
              Clear All
            </button>
          </div>

          <div className="form">
            <div className="row">
              <label>Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">All</option>
                {Array.from(new Set(expenses.map((x) => x.category))).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <label>From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>

            <div className="row">
              <label>To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>

            <button
              className="btn secondary"
              onClick={() => {
                setFilterCategory("All")
                setFromDate("")
                setToDate("")
              }}
            >
              Reset Filters
            </button>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="cardTop">
          <h2>Expense List</h2>
          <p>
            Showing <b>{filteredExpenses.length}</b> of <b>{expenses.length}</b>
          </p>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
  <div className="emptyBox">
    <div className="emptyIcon">📉</div>
    <b>No expenses found</b>
    <p>Add your first expense to start tracking.</p>
  </div>
</td>

                </tr>
              ) : (
                filteredExpenses.map((x) => (
                  <tr key={x._id}>
                    <td>{x.date}</td>
                    <td>{formatINR(x.amount)}</td>
                    <td>
  <span className="badge">{x.category}</span>
</td>

                    <td>{x.note || "-"}</td>
                    <td className="actions">
  <button className="btn secondary small" onClick={() => startEdit(x)}>
    Edit
  </button>
  <button className="btn danger small" onClick={() => deleteExpense(x._id)}>
    Delete
  </button>
</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footer">
        <p>Built for hackathon — React + LocalStorage</p>
      </footer>
    </div>
  )
}
