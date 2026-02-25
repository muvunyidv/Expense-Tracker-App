import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Calendar, Plus, Trash2, Loader2, ListTodo, AlertCircle, Banknote, Lock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import API from "../api";
import ExpenseViewModal from "../Components/ExpenseViewModal";

export default function TodoPage() {
  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    task: "", 
    cost: "", 
    startDate: getTodayDate(), // Default to current date
    endDate: "" 
  });
  const [currentUserId, setCurrentUserId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);

  // Helper to notify Dashboard (Sidebar & Top Widgets) to refresh
  const refreshDashboard = useCallback(() => {
    window.dispatchEvent(new Event("plansUpdated"));
    window.dispatchEvent(new Event("expensesUpdated"));
  }, []);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/todos");
      const sorted = res.data.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
      setTodos(sorted);
    } catch (err) {
      console.error("Error fetching todos", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setCurrentUserId(payload.id); 
      } catch (e) {
        console.error("Token decoding failed", e);
      }
    }
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert("Validation Error: End Date must be later than Start Date.");
      return;
    }

    try {
      const payload = { 
        ...formData, 
        estCost: Number(formData.cost) || 0 
      };
      
      const res = await API.post("/todos", payload);
      setTodos(prev => [res.data, ...prev]);
      
      // Reset form while keeping the current date as default
      setFormData({ 
        task: "", 
        cost: "", 
        startDate: getTodayDate(), 
        endDate: "" 
      });
      
      refreshDashboard();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const toggleStatus = async (id, isCurrentlyCompleted) => {
    try {
      const newStatus = !isCurrentlyCompleted;
      await API.patch(`/todos/${id}`, { 
        status: newStatus ? "completed" : "pending", 
        completed: newStatus 
      });

      setTodos(prev => {
        const updated = prev.map(t => 
          t._id === id ? { ...t, completed: newStatus, status: newStatus ? "completed" : "pending" } : t
        );
        return updated.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
      });

      refreshDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
      refreshDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const openExpenseDetails = (todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <ExpenseViewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedTodo} 
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">Planned Tasks</h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Timeline & Execution</p>
        </div>

        <form 
          onSubmit={handleCreate} 
          className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50"
        >
          <div className="md:col-span-1">
            <label className="text-[10px] font-black uppercase ml-1 mb-1 block text-zinc-500">Task Name</label>
            <input 
              className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" 
              placeholder="Objective?"
              value={formData.task}
              onChange={(e) => setFormData({...formData, task: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase ml-1 mb-1 block text-zinc-500">Est. Cost</label>
            <div className="relative">
              <input 
                type="number"
                className="w-full p-3 pl-8 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                placeholder="0"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
              <Banknote className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
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
              min={formData.startDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 uppercase text-xs tracking-widest active:scale-95">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>
      </div>

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
              {todos.map((todo) => {
                const creatorId = todo.recordedBy?._id || todo.recordedBy;
                const isOwner = String(creatorId) === String(currentUserId);
                const displayCost = todo.estCost || todo.cost || 0;
                const isDone = todo.completed || todo.status === 'completed';
                
                return (
                  <div 
                    key={todo._id} 
                    onClick={() => openExpenseDetails(todo)}
                    className={`group flex items-center justify-between p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
                      isDone 
                      ? 'bg-zinc-50 border-zinc-100 opacity-70' 
                      : 'bg-white border-zinc-100 hover:border-orange-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(todo._id, isDone);
                        }}
                        disabled={!isOwner}
                        className={`transition-transform ${
                          !isOwner 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'hover:scale-110 active:scale-90'
                        }`}
                      >
                        {isDone ? 
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : 
                          <Circle className={`w-8 h-8 ${!isOwner ? 'text-zinc-100' : 'text-zinc-200 group-hover:text-orange-500'}`} />
                        }
                      </button>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className={`text-base font-bold capitalize ${isDone ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                            {todo.task}
                          </h4>
                          
                          {displayCost > 0 && (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black rounded-full border uppercase transition-all ${
                              isDone ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                              {Number(displayCost).toLocaleString()} RWF
                            </div>
                          )}

                          {!isOwner && (
                            <div className="flex items-center gap-1 text-[9px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase tracking-widest">
                               <Lock className="w-2.5 h-2.5" /> Read Only
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1">
                            <Calendar className={`w-3 h-3 ${isDone ? 'text-zinc-300' : 'text-orange-500'}`} /> 
                            {new Date(todo.startDate).toLocaleDateString('en-GB')}
                          </span>
                          <span className="text-zinc-200">—</span>
                          <span>
                            {todo.endDate 
                              ? new Date(todo.endDate).toLocaleDateString('en-GB') 
                              : "No Deadline"}
                          </span>
                          {todo.recordedBy?.username && (
                             <span className="flex items-center gap-1 text-orange-400/70">
                               <User className="w-3 h-3" /> {todo.recordedBy.username}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTodo(todo._id);
                        }} 
                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}