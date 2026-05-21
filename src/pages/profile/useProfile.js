import { useCallback, useEffect, useState } from 'react';
import { userService } from '../../api/services';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getProfile();
      const data = res?.data?.data || res?.data;
      setProfile(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load profile.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile, setProfile };
}

export function formatDob(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('/')) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}
