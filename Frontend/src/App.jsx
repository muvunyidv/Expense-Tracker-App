import { useEffect, useState } from "react"
import axios from "axios"

function App() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    axios.get("http://localhost:5000/expenses")
      .then(res => setExpenses(res.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>

      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <ul>
          {expenses.map(exp => (
            <li key={exp._id}>
              {exp.title} - ${exp.amount} ({exp.category})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
