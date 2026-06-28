import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const url = filterStatus ? `${API_URL}?status=${filterStatus}` : API_URL;
      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      showNotification('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Create or Update task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const res = await axios.put(`${API_URL}/${editingTask._index || editingTask._id}`, taskData);
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
        setEditingTask(null);
        showNotification('Task updated successfully!');
      } else {
        const res = await axios.post(API_URL, taskData);
        setTasks([res.data, ...tasks]);
        showNotification('Task added successfully!');
      }
    } catch (err) {
      showNotification('Error processing request');
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
        showNotification('Task deleted.');
      } catch (err) {
        showNotification('Error deleting task');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Task Tracker Dashboard</h1>
        {notification && <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px' }}>{notification}</div>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'window.innerWidth > 600 ? "1fr 2fr" : "1fr"', gap: '20px' }}>
        <div>
          <TaskForm onSave={handleSaveTask} currentTask={editingTask} setEditingTask={setEditingTask} />
          
          <div style={{ marginTop: '20px' }}>
            <label><strong>Filter by Status: </strong></label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <h3>Your Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? <p>No tasks found.</p> : (
            tasks.map(task => (
              <div key={task._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>{task.title}</h4>
                  <div>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: task.priority === 'High' ? '#f8d7da' : '#fff3cd', marginRight: '5px' }}>{task.priority}</span>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: '#e2e3e5' }}>{task.status}</span>
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '14px' }}>{task.description}</p>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => setEditingTask(task)} style={{ marginRight: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

