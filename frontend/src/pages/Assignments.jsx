import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_URL } from '../config.js';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);

  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    entityType: 'COMPANY',
    entityId: '',
    assignmentRole: 'Account Owner',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [assRes, usrRes, compRes, contRes] = await Promise.all([
      fetch(`${API_URL}/api/assignments`, { headers }),
      fetch(`${API_URL}/api/users`, { headers }),
      fetch(`${API_URL}/api/companies`, { headers }),
      fetch(`${API_URL}/api/contacts`, { headers }),
    ]);

    setAssignments(await assRes.json());
    setUsers(await usrRes.json());
    setCompanies(await compRes.json());
    setContacts(await contRes.json());
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    fetchData();
  };

  const getEntityName = (type, id) => {
    if (type === 'COMPANY') return companies.find((c) => c.id === id)?.name || 'Unknown';
    return contacts.find((c) => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h2>Role Assignments</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Assign Role
        </button>
      </div>

      <div className="glass-card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Entity Type</th>
              <th style={{ padding: '1rem' }}>Entity Name</th>
              <th style={{ padding: '1rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{a.user?.name}</td>
                <td style={{ padding: '1rem' }}>{a.assignmentRole}</td>
                <td style={{ padding: '1rem' }}>{a.entityType}</td>
                <td style={{ padding: '1rem' }}>{getEntityName(a.entityType, a.entityId)}</td>
                <td style={{ padding: '1rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div className="glass-card animate-slide-in" style={{ width: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Assign Role</h3>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">User</label>
                <select
                  className="input-field"
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                >
                  <option value="">Select User...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Entity Type</label>
                <select
                  className="input-field"
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value, entityId: '' })}
                >
                  <option value="COMPANY">Company</option>
                  <option value="CONTACT">Contact</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">
                  {formData.entityType === 'COMPANY' ? 'Company' : 'Contact'}
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.entityId}
                  onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                >
                  <option value="">Select...</option>
                  {(formData.entityType === 'COMPANY' ? companies : contacts).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <input
                  className="input-field"
                  required
                  value={formData.assignmentRole}
                  onChange={(e) => setFormData({ ...formData, assignmentRole: e.target.value })}
                  placeholder="e.g. Account Owner"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
