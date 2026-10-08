import { useState, useEffect } from "react";

const STORAGE_KEY = "todo-app:tasks";

// Read saved tasks once, on first render. Falls back to an empty list
// if nothing is saved or the stored JSON is invalid.
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function TodoApp() {
  const [tasks, setTasks] = useState(loadTasks); // lazy initializer: runs once
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"

  // Save to localStorage whenever the task list changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage may be full or blocked; the app still works in memory.
    }
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);
    setText("");
  };

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => setTasks((prev) => prev.filter((t) => !t.done));

  const remaining = tasks.filter((t) => !t.done).length;
  const visible = tasks.filter((t) =>
    filter === "active" ? !t.done : filter === "done" ? t.done : true
  );

  return (
    <div className="todo">
      <style>{css}</style>

      <h1>Tasks</h1>

      <form onSubmit={addTask} className="add">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task"
          aria-label="New task"
        />
        <button type="submit">Add task</button>
      </form>

      <div className="filters" role="group" aria-label="Filter tasks">
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            className={filter === f ? "on" : ""}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 ? "No tasks yet. Add your first one above." : "Nothing in this view."}
        </p>
      ) : (
        <ul>
          {visible.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
                <span>{t.title}</span>
              </label>
              <button className="del" onClick={() => deleteTask(t.id)} aria-label={`Delete ${t.title}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer>
        <span>
          {remaining} {remaining === 1 ? "task" : "tasks"} left
        </span>
        {tasks.some((t) => t.done) && (
          <button className="link" onClick={clearDone}>
            Clear completed
          </button>
        )}
      </footer>
    </div>
  );
}

const css = `
.todo { max-width: 32rem; margin: 3rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; color: #1b2430; }
.todo h1 { font-size: 2rem; margin: 0 0 1rem; }
.todo button { font: inherit; cursor: pointer; }
.todo :focus-visible { outline: 3px solid #2b3f8c; outline-offset: 2px; }
.add { display: flex; gap: .5rem; margin-bottom: 1rem; }
.add input { flex: 1; font: inherit; padding: .6rem .8rem; border: 2px solid #b9c2c9; border-radius: 6px; }
.add button { padding: .6rem 1rem; border: 0; border-radius: 6px; background: #2b3f8c; color: #fff; font-weight: 600; }
.filters { display: flex; gap: .5rem; margin-bottom: .75rem; }
.filters button { padding: .3rem .8rem; border: 2px solid #b9c2c9; border-radius: 999px; background: transparent; }
.filters button.on { border-color: #2b3f8c; background: #2b3f8c; color: #fff; }
.todo ul { list-style: none; margin: 0; padding: 0; }
.todo li { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .6rem 0; border-bottom: 1px solid #d8dfe3; }
.todo li label { display: flex; align-items: center; gap: .6rem; flex: 1; cursor: pointer; }
.todo li.done span { text-decoration: line-through; color: #7a858f; }
.del, .link { background: none; border: 0; color: #b3261e; }
.link { color: #2b3f8c; }
.empty { color: #5b6672; padding: 1rem 0; }
.todo footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; color: #5b6672; }
`;
