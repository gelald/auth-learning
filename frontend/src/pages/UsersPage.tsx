import { useState, useEffect } from 'react';
import { userService, User } from '../services';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(id);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>User Management</h2>

      {error && (
        <div className="alert alert-error">
          {error}
          <button
            className="btn btn-secondary"
            style={{ marginLeft: '12px' }}
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>
                  <span className={`badge badge-${user.role === 'admin' ? 'danger' : 'info'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.active ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning">Inactive</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
