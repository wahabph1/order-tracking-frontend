import React, { useState, useEffect, useCallback } from 'react';
import OrderForm from '../src/OrderForm.js'; 
import EditOrderModal from '../src/EditOrderModal.jsx';

// ******************************************************************
// 🛠️ FINAL VERCEL FIX: RELATIVE API URL
// Deployed Vercel Frontend par, sirf relative path /api/orders use karte hain.
// Vercel khud hi isko full URL (https://order-tracking-frontend.vercel.app/api/orders) bana dega.
// ******************************************************************
const API_URL = '/api/orders'; 
// ******************************************************************

// --- Reusable Component: Status Tag ---
const StatusTag = ({ status }) => {
    let className = 'status-tag ';
    if (status === 'Pending') className += 'status-pending';
    else if (status === 'In Transit') className += 'status-in-transit';
    else if (status === 'Delivered') className += 'status-delivered';
    else if (status === 'Cancelled') className += 'status-cancelled';
    else className += 'status-pending'; 

    return <span className={className}>{status}</span>;
};


const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOwner, setFilterOwner] = useState('All');

    // List of unique owners for the filter dropdown
    const uniqueOwners = ['All', ...new Set(orders.map(order => order.owner))];


    // Function to fetch data from the API
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        let url = `${API_URL}`; // Now uses relative path /api/orders

        // Construct query parameters
        const params = new URLSearchParams();
        if (filterOwner !== 'All') {
            params.append('owner', filterOwner);
        }
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorMessage}`);
            }
            const data = await response.json();
            setOrders(data);
        } catch (e) {
            console.error("Data fetching error:", e);
            // Error message changed to reflect the most likely remaining issue (backend down)
            setError(`Orders load karne mein error aa gayi hai. Server se connection nahi ho paa raha hai. Ensure karein ki backend (serverless function) deploy ho chuka ho. Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [filterOwner, searchTerm]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    const handleDelete = async (orderId) => {
        if (!window.confirm("Kya aap sach mein is order ko delete karna chahte hain?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Order delete nahi ho paya.");
            }

            fetchOrders();
            console.log("Order successfully deleted.");
        } catch (e) {
            console.error("Deletion error:", e);
            setError("Order delete karne mein error aa gayi.");
        }
    };

    const openEditModal = (order) => {
        setCurrentOrder(order);
        setIsModalOpen(true);
    };

    const handleOrderAdded = () => {
        fetchOrders(); 
    };

    const handleOrderUpdated = () => {
        setIsModalOpen(false);
        setCurrentOrder(null);
        fetchOrders(); 
    };

    if (loading) return <div className="status-message">Data load ho raha hai...</div>;
    // Show error message prominently
    if (error) return <div className="error-message p-4 text-center text-xl">{error}</div>;

    return (
        <div className="order-tracking-dashboard">
            <h2 className="dashboard-heading">Order Tracking Dashboard</h2>

            {/* Order Creation Form is passed the API_URL */}
            <OrderForm API_URL={API_URL} onOrderAdded={handleOrderAdded} />

            <div className="table-section">
                
                {/* Filter and Search Bar */}
                <div className="filter-search-container">
                    <div className="input-group">
                        <label htmlFor="owner-filter">Owner Filter</label>
                        <select 
                            id="owner-filter"
                            value={filterOwner}
                            onChange={(e) => setFilterOwner(e.target.value)}
                        >
                            {uniqueOwners.map(owner => (
                                <option key={owner} value={owner}>{owner}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="search-input">Serial Number Search</label>
                        <input 
                            id="search-input"
                            type="text"
                            placeholder="Serial Number se khojein..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="order-count">
                    Total Orders: {orders.length}
                </div>

                {/* Orders Table */}
                <div className="table-wrapper">
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>Serial No.</th>
                                <th>Owner</th>
                                <th>Order Date</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="status-message">Koi orders nahi mile.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order.serialNumber}</td>
                                        <td>{order.owner}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td><StatusTag status={order.deliveryStatus} /></td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => openEditModal(order)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(order._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Edit Modal */}
            {isModalOpen && currentOrder && (
                <EditOrderModal 
                    API_URL={API_URL}
                    order={currentOrder}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleOrderUpdated}
                />
            )}
        </div>
    );
};

export default OrderTable;
