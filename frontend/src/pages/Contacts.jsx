import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_URL } from '../config.js';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', companyId: '' });

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, []);

  const fetchContacts = async () => {
    const res = await fetch(`${API_URL}/api/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setContacts(await res.json());
  };

  const fetchCompanies = async () => {
    const res = await fetch(`${API_URL}/api/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(await res.json());
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    setFormData({ name: '', email: '', phone: '', companyId: '' });
    fetchContacts();
  };

  return (
    <div className="animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h2>Contacts</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Contact
        </button>
      </div>

      <div className="glass-card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Company</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{c.id}</td>
                <td style={{ padding: '1rem' }}>{c.name}</td>
                <td style={{ padding: '1rem' }}>{c.email}</td>
                <td style={{ padding: '1rem' }}>{c.company?.name}</td>
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
            <h3 style={{ marginBottom: '1.5rem' }}>Add Contact</h3>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input
                  className="input-field"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Company</label>
                <select
                  className="input-field"
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                >
                  <option value="">Select a company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
