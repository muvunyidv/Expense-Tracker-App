const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

console.log("Starting Expense Tracker server...")

mongoose.connect("mongodb://127.0.0.1:27017/expenseTracker")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err))

app.get("/", (req, res) => {
  res.send("Expense Tracker API running")
})

app.listen(5000, () => {
  console.log("Server listening on http://localhost:5000")
})
