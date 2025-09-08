import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export const useUserOrders = (page = 1, limit = 10) => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // Get user orders
  const fetchOrders = async (pageNum = page, limitNum = limit) => {
    if (!session?.user?.userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.orders.getMyOrders({
        page: pageNum,
        limit: limitNum
      });
      
      if (response.success) {
        setOrders(response.data || []);
        setPagination(response.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: pageNum,
          limit: limitNum
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get order details
  const getOrderDetails = async (orderId) => {
    if (!session?.user?.userId) throw new Error('User not authenticated');
    
    try {
      const response = await api.orders.getOrderDetails(orderId);
      return response.data;
    } catch (err) {
      console.error('Error fetching order details:', err);
      throw err;
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!session?.user?.userId) throw new Error('User not authenticated');
    
    try {
      const response = await api.orders.cancelOrder(orderId);
      // Refresh orders list
      await fetchOrders();
      return response.data;
    } catch (err) {
      console.error('Error cancelling order:', err);
      throw err;
    }
  };

  // Load orders when session changes
  useEffect(() => {
    if (session?.user?.userId) {
      fetchOrders();
    }
  }, [session?.user?.userId, page, limit]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    getOrderDetails,
    cancelOrder
  };
};











