import React, { useEffect, useState } from 'react';
import './ApiIntegration.css';
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaFlask } from 'react-icons/fa';
import config from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from 'sweetalert2';


const typeOptions = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'offer', label: 'Offer' },
  { value: 'agent', label: 'Agent' },
];

const ApiIntegration = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', type: 'invoice' });
  const [editRow, setEditRow] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
  console.log("Active Dropdown:", activeDropdown);
}, [activeDropdown]);
  // Fetch data from API
  useEffect(() => {
    if (!token) return;
    fetch(`https://bill.ai3dscanning.com/api/group/hooks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(res => setData(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setData([]));
  }, [token]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`https://bill.ai3dscanning.com/api/group/hooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: '', url: '', type: 'invoice' });
        // Refresh data
        const updated = await fetch(`https://bill.ai3dscanning.com/api/group/hooks`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        setData(Array.isArray(updated) ? updated : (updated.data || []));
      }
    } catch (err) {}
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token || !editId) return;
    try {
      const res = await fetch(`https://bill.ai3dscanning.com/api/group/hooks/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setIsEditMode(false);
        setEditRow(null);
        setEditId(null);
        setForm({ name: '', url: '', type: 'invoice' });
        // Refresh data
        const updated = await fetch(`https://bill.ai3dscanning.com/api/group/hooks`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        setData(Array.isArray(updated) ? updated : (updated.data || []));
        Swal.fire({ icon: 'success', title: 'Success', text: 'API integration updated successfully!' });
      }
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!token) return;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    try {
      await fetch(`https://bill.ai3dscanning.com/api/group/hooks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh data
      const updated = await fetch(`https://bill.ai3dscanning.com/api/group/hooks`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      setData(Array.isArray(updated) ? updated : (updated.data || []));
      setActiveDropdown(null);
      Swal.fire('Deleted!', 'API integration has been deleted.', 'success');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete.' });
    }
  };

  const handleTestHook = async (id) => {
    if (!token) return;
    try {
      const res = await fetch('https://bill.ai3dscanning.com/api/group/hook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hook_id: id }),
      });
      const data = await res.json();
      const msg = data.message || (res.ok ? 'Test hook succeeded!' : 'Test hook failed.');
      let html = `<div style='font-size:1.2rem;font-weight:600;color:${res.ok ? '#27ae60' : '#c0392b'};margin-bottom:10px;'>${msg}</div>`;
      const extra = { ...data };
      delete extra.message;
      if (Object.keys(extra).length > 0) {
        html += `<pre style='text-align:left;white-space:pre-wrap;background:#f8f8f8;padding:10px;border-radius:6px;'>${JSON.stringify(extra, null, 2)}</pre>`;
      }
      Swal.fire({
        icon: res.ok ? 'success' : 'error',
        title: res.ok ? 'Test Hook Success' : 'Test Hook Failed',
        html
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Test Hook Error', text: 'An error occurred while testing the hook.' });
    }
  };

  const startEdit = (row, idx) => {
    setEditRow(idx);
    setEditId(row.id);
    setForm({ name: row.name, url: row.url, type: row.type });
    setIsEditMode(true);
    setShowModal(true);
    setActiveDropdown(null);
  };

  return (
    <div className="api-integration-container">
      <div className="api-integration-header">
        <h2>Zapier API Integration</h2>
        <button className="add-data-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Hooks
        </button>
      </div>
      <div className="api-integration-table-responsive">
        <table className="api-integration-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>URL</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: '#b0bec5', fontSize: '1.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '2.5rem', color: '#3499db' }}>📭</span>
                    No API integrations found. Click <b>Add Data</b> to create your first entry!
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  {editRow === index ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          type="url"
                          name="url"
                          value={form.url}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleInputChange}
                        >
                          {typeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="actions">
                        <div className="dropdown-wrapper">
                          <HiDotsHorizontal
  size={30}
  onClick={(e) => {
    e.stopPropagation();
    toggleDropdown(index);
  }}
  className="cursor-pointer action-icon"
/>
                          {activeDropdown === index && (
                            <div className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0 mt-4">
                              <button
                                className="dropdown-item rounded-2 py-2 px-3 text-dark"
                                onClick={handleEditSubmit}
                                disabled={loading}
                              >
                                Save
                              </button>
                              <button
                                className="dropdown-item rounded-2 py-2 px-3 text-dark"
                                onClick={() => { setShowModal(false); setIsEditMode(false); setEditRow(null); setEditId(null); }}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.name}</td>
                      <td>{item.url}</td>
                      <td>{item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}</td>
                      <td className="action-cell">
                        <div className="dropdown-wrapper">
                          <FaEllipsisV onClick={() => toggleDropdown(index)} className="action-icon" />
                          {activeDropdown === index && (
                            <div className="dropdown-menu show">
                              <button className="dropdown-item" onClick={() => startEdit(item, index)}><FaEdit /> Edit</button>
                              <button className="dropdown-item" onClick={() => handleDelete(item.id)}><FaTrash /> Delete</button>
                              <button className="dropdown-item" onClick={() => handleTestHook(item.id)}><FaFlask /> Test Hooks</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="popover-overlay" onClick={() => { setShowModal(false); setIsEditMode(false); setEditRow(null); setEditId(null); }}>
          <div className="popover-pop" onClick={e => e.stopPropagation()}>
            <div className="popover-arrow" />
            <h3 className="popover-title">{isEditMode ? 'Edit API Data' : 'Add Hooks'}</h3>
            <form onSubmit={isEditMode ? handleEditSubmit : handleAddData} className="popover-form">
              <div className="popover-form-row">
                <label>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange}  required />
              </div>
              <div className="popover-form-row">
                <label>URL</label>
                <input type="url" name="url" value={form.url} onChange={handleInputChange} required />
              </div>
              <div className="popover-form-row">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleInputChange} required>
                  {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="popover-actions">
                <button type="button" onClick={() => { setShowModal(false); setIsEditMode(false); setEditRow(null); setEditId(null); }}>Cancel</button>
                <button type="submit">{isEditMode ? 'Save' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegration; 