import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Calendar, Plus, Trash2, Loader2, ListTodo, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import API from "../api";

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ task: "", startDate: "", endDate: "" });

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/todos");
      const sorted = res.data.sort((a, b) => (a.status === 'completed') - (b.status === 'completed'));
      setTodos(sorted);
    } catch (err) {
      console.error("Error fetching todos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/todos", formData);
      setTodos([res.data, ...todos]);
      setFormData({ task: "", startDate: "", endDate: "" });
    } catch (err) {
      console.error("Failed to create task");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    try {
      await API.patch(`/todos/${id}`, { status: newStatus });
      setTodos(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t)
                             .sort((a, b) => (a.status === 'completed') - (b.status === 'completed')));
    } catch (err) {
      console.error("Update failed");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await API.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">Planned Tasks</h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Timeline & Execution</p>
        </div>

        {/* FORM: Forcing white background and visible text */}
        <form 
          onSubmit={handleCreate} 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50"
        >
          <div className="md:col-span-1">
            <label className="text-[10px] font-black uppercase ml-1 mb-1 block text-zinc-500">Objective</label>
            <input 
              className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
              placeholder="What needs to be done?"
              value={formData.task}
              onChange={(e) => setFormData({...formData, task: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase ml-1 mb-1 block text-zinc-500">Start Date</label>
            <input 
              type="date" 
              className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase ml-1 mb-1 block text-zinc-500">End Date</label>
            <input 
              type="date" 
              className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 uppercase text-xs tracking-widest active:scale-95">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Task List Section */}
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-sm font-black flex items-center gap-2 text-zinc-500 uppercase tracking-widest">
            <ListTodo className="w-5 h-5 text-orange-500" /> Current Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
             <div className="py-20 flex flex-col items-center gap-3">
               <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
               <span className="text-[10px] font-black text-zinc-400 uppercase">Loading tasks...</span>
             </div>
          ) : todos.length === 0 ? (
            <div className="py-20 text-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200">
              <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">No active plans found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {todos.map((todo) => (
                <div 
                  key={todo._id} 
                  className={`group flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${
                    todo.status === 'completed' 
                    ? 'bg-zinc-50 border-zinc-100 opacity-60' 
                    : 'bg-white border-zinc-100 hover:border-orange-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => toggleStatus(todo._id, todo.status)}
                      className="transition-transform hover:scale-110 active:scale-90"
                    >
                      {todo.status === 'completed' ? 
                        <CheckCircle2 className="w-8 h-8 text-green-500" /> : 
                        <Circle className="w-8 h-8 text-zinc-200 hover:text-orange-500" />
                      }
                    </button>
                    <div>
                      <h4 className={`text-base font-bold capitalize ${todo.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                        {todo.task}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-orange-500" /> {new Date(todo.startDate).toLocaleDateString('en-GB')}</span>
                        <span className="text-zinc-200">—</span>
                        <span>{new Date(todo.endDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo._id)} 
                    className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}