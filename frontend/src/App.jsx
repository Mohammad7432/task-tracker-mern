import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// COMPONENT 1: TASK FORM REGISTRATION BLOCK
// ==========================================
const TaskForm = ({ onSave, currentTask, setEditingTask }) => {
  const [task, setTask] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentTask) {
      setTask(currentTask);
    } else {
      setTask({ title: '', description: '', status: 'Pending', priority: 'Medium' });
    }
  }, [currentTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) {
      setError('Task title is required! Action blocked.');
      return;
    }
    setError('');
    onSave(task);
    setTask({ title: '', description: '', status: 'Pending', priority: 'Medium' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
      <h3 style={{ marginTop: 0 }}>{currentTask ? '📝 Edit Workspace Task' : '➕ Add New Workspace Task'}</h3>
      {error && <p style={{ color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>⚠️ {error}</p>}
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Task Title *" 
          value={task.title} 
          onChange={(e) => setTask({ ...task, title: e.target.value })} 
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <textarea 
          placeholder="Task Description..." 
          value={task.description} 
          onChange={(e) => setTask({ ...task, description: e.target.value })} 
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', height: '80px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {currentTask ? 'Update Task' : 'Save Task'}
        </button>
        {currentTask && (
          <button type="button" onClick={() => setEditingTask(null)} style={{ padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// ==========================================
// COMPONENT 2: MAIN WORKSPACE INTERFACE
// ==========================================
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState('');

  const fetchTasks = async () => {
    try {
      const url = filterStatus ? `${API_URL}?status=${filterStatus}` : API_URL;
      const res = await axios.get(url);
      
      // AUTO-UNWRAP CONTEXT: Unpacks data cleanly whether backend responds with a direct list or wrapped object
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      } else if (res.data && Array.isArray(res.data.tasks)) {
        setTasks(res.data.tasks);
      } else if (res.data && Array.isArray(res.data.data)) {
        setTasks(res.data.data);
      } else {
        setTasks([]);
        showNotification('Task layout sync matched an unreadable format structure.');
      }
    } catch (err) {
      setTasks([]);
      showNotification('Server is initializing connection. Please wait 10 seconds.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await axios.put(`${API_URL}/${editingTask._id}`, taskData);
        showNotification('Task updated successfully!');
      } else {
        await axios.post (API_URL, taskData);
        showNotification('Task recorded successfully!');
      }
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      showNotification('Action failed. Check API operational logs.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Permanently remove this task from database?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showNotification('Task deleted from timeline.');
        fetchTasks();
      } catch (err) {
        showNotification('Error processing task removal request.');
      }
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High': return { background: '#ffebee', color: '#c62828' };
      case 'Medium': return { background: '#fff3e0', color: '#ef6c00' };
      default: return { background: '#e8f5e9', color: '#2e7d32' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Task Tracker Workspace</h1>
        {notification && (
          <div style={{ background: '#e8f4fd', color: '#0056b3', padding: '12px', borderRadius: '6px', margin: '15px 0', border: '1px solid #b8daff', fontWeight: 'bold' }}>
            🔔 {notification}
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        <div>
          <TaskForm onSave={handleSaveTask} currentTask={editingTask} setEditingTask={setEditingTask} />
          
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>🔍 Filter Workspace Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <h2 style={{ marginTop: 0, color: '#444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Task Board Layout</span>
            <span style={{ fontSize: '14px', background: '#eee', padding: '3px 10px', borderRadius: '12px', color: '#666' }}>Total: {tasks.length}</span>
          </h2>
          
          {tasks.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', padding: '35px 20px', textAlign: 'center', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ccc' }}>
              No tasks matched this condition.
            </p>
          ) : (
            tasks.map(task => (
              <div key={task._id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#222' }}>{task.title}</h3>
                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', ...getPriorityBadgeStyle(task.priority) }}>{task.priority}</span>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: '#e2e3e5', color: '#383d41', fontWeight: 'bold' }}>{task.status}</span>
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px 0', lineHeight: '1.4' }}>{task.description || 'No descriptive context logs added.'}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                  <button onClick={() => setEditingTask(task)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Edit</button>
                  <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
