import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';

export const useUserAddresses = () => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user addresses
  const fetchAddresses = async () => {
    if (!session?.user?.userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.userAddresses.getAll(session.user.userId);
      setAddresses(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new address
  const createAddress = async (addressData) => {
    if (!session?.user?.userId) throw new Error('User not authenticated');
    
    try {
      const response = await api.userAddresses.create({
        ...addressData,
        userId: session.user.userId
      });
      
      // Refresh addresses list
      await fetchAddresses();
      
      return response.data;
    } catch (err) {
      console.error('Error creating address:', err);
      throw err;
    }
  };

  // Update address
  const updateAddress = async (id, addressData) => {
    try {
      const response = await api.userAddresses.update(id, addressData);
      
      // Refresh addresses list
      await fetchAddresses();
      
      return response.data;
    } catch (err) {
      console.error('Error updating address:', err);
      throw err;
    }
  };

  // Delete address
  const deleteAddress = async (id) => {
    try {
      await api.userAddresses.delete(id);
      
      // Refresh addresses list
      await fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      throw err;
    }
  };

  // Load addresses when session changes
  useEffect(() => {
    if (session?.user?.userId) {
      fetchAddresses();
    }
  }, [session?.user?.userId]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress
  };
};


