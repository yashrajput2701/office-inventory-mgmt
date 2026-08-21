import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '../api/client';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Could not change password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-page narrow">
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit}>
        <label>Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

        <label>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">Password updated successfully.</p>}

        <button type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
      </form>
    </div>
  );
}
