import React, { useState, useEffect } from 'react';

const TaskForm = ({ onSave, currentTask, setEditingTask }) => {
  const [task, setTask] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentTask) setTask(currentTask);
  }, [currentTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) {
      setError('Task title is required!');
      return;
    }
    setError('');
    onSave(task);
    setTask({ title: '', description: '', status: 'Pending', priority: 'Medium' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>{currentTask ? 'Edit Task' : 'Add New Task'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Task Title *" 
          value={task.title} 
          onChange={(e) => setTask({ ...task, title: e.target.value })} 
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <textarea 
          placeholder="Description" 
          value={task.description} 
          onChange={(e) => setTask({ ...task, description: e.target.value })} 
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })} style={{ flex: 1, padding: '8px' }}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })} style={{ flex: 1, padding: '8px' }}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <button type="submit" style={{ padding: '10px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {currentTask ? 'Update Task' : 'Add Task'}
      </button>
      {currentTask && (
        <button type="button" onClick={() => setEditingTask(null)} style={{ marginLeft: '10px', padding: '10px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default TaskForm;

