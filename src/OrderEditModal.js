// Frontend/src/components/EditOrderModal.jsx (Enhanced with View/Edit/Delete Functionality)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// CRITICAL FIX: Localhost URL hata kar Vercel/Relative Path use kiya gaya hai.
const DEFAULT_API_URL = '/api/orders';

// Conceptual Code se updated options
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
const OWNER_OPTIONS = ['Emirate Essentials', 'Ahsan', 'Habibi Tools'];

// API_URL ko props se liya jayega (OrderTable se), agar nahi mila to default use hoga.
function EditOrderModal({ order, onClose, onOrderUpdated, API_URL = DEFAULT_API_URL }) {
    
    const [formData, setFormData] = useState({
        serialNumber: '', 
        orderDate: '',
        deliveryStatus: '',
        owner: '',
        notes: '', // New field for notes during update
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(''); // Custom message state for feedback
    const [editMode, setEditMode] = useState(false); // To toggle between View and Edit
    const [showConfirmDelete, setShowConfirmDelete] = useState(false); // For custom delete confirmation

    // Data initialization and Reset on 'order' change
    useEffect(() => {
        if (order) {
            setFormData({
                serialNumber: order.serialNumber, 
                // Date ko YYYY-MM-DD format mein convert karein
                orderDate: new Date(order.orderDate).toISOString().split('T')[0],
                deliveryStatus: order.deliveryStatus,
                owner: order.owner,
                notes: '', // Notes ko har baar reset rakhein
            });
            setMessage('');
            setEditMode(false); // Default to View Mode on open
        }
    }, [order]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        // Payload mein notes bhi shamil kiya ja sakta hai (backend update logic par nirbhar karta hai)
        const updatedData = { 
            serialNumber: formData.serialNumber, 
            orderDate: formData.orderDate, 
            deliveryStatus: formData.deliveryStatus, 
            owner: formData.owner,
            notes: formData.notes.trim() // Notes bhejein
        };
        
        try {
            // PUT Request: API_URL/order._id
            await axios.put(`${API_URL}/${order._id}`, updatedData);
            
            setMessage(`Success: Order ${formData.serialNumber} successfully updated!`);
            onOrderUpdated(); 
            
            // Success hone par thodi der baad modal band karein
            setTimeout(onClose, 1500); 

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update order.';
            setMessage(`Error: ${errorMessage}`);
            console.error('Update error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async () => {
        setShowConfirmDelete(false); // Confirmation band karein
        setIsSubmitting(true);
        setMessage('');

        try {
            await axios.delete(`${API_URL}/${order._id}`);
            setMessage(`Success: Order ${order.serialNumber} successfully deleted!`);
            onOrderUpdated(); 
            setTimeout(onClose, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete order.';
            setMessage(`Error: ${errorMessage}`);
            console.error('Delete error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusTag = order.deliveryStatus ? order.deliveryStatus.toLowerCase().replace(' ', '-') : 'pending';

    return (
        // Overlay par click karne par modal band ho
        <div className="modal-overlay" onClick={!isSubmitting ? onClose : null}>
            {/* Inner content par click ko rokne ke liye */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> 
                <button onClick={onClose} className="close-btn" disabled={isSubmitting}>&times;</button>
                <h3 className="text-xl font-semibold mb-4">Order: {order.serialNumber}</h3>
                
                {/* Feedback Message */}
                {message && (
                    <p className={`form-message p-2 mb-3 rounded-lg text-center ${message.startsWith('Error') ? 'bg-red-100 text-red-700 error-message' : 'bg-green-100 text-green-700 success-message'}`}>
                        {message}
                    </p>
                )}

                {/* Conditional Rendering: View Mode vs Edit Mode */}
                {!editMode ? (
                    <>
                        {/* VIEW MODE (Details and History) */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg mb-4">
                            <p className="flex justify-between">
                                <strong className="text-gray-600">Owner:</strong> 
                                <span className="font-medium">{order.owner}</span>
                            </p>
                            <p className="flex justify-between">
                                <strong className="text-gray-600">Order Date:</strong> 
                                <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</span>
                            </p>
                            <p className="flex justify-between items-center">
                                <strong className="text-gray-600">Current Status:</strong> 
                                <span className={`status-tag status-${statusTag} px-3 py-1 text-sm font-semibold rounded-full`}>
                                    {order.deliveryStatus}
                                </span>
                            </p>
                        </div>
                        
                        <div className="flex justify-between space-x-2 mt-4">
                            <button onClick={() => setEditMode(true)} className="action-btn edit-btn w-1/2" disabled={isSubmitting}>
                                Edit Details
                            </button>
                            <button onClick={() => setShowConfirmDelete(true)} className="action-btn delete-btn w-1/2" disabled={isSubmitting}>
                                Delete Order
                            </button>
                        </div>

                        <h4 className="mt-6 border-b pb-1 text-gray-700 font-semibold">Status History (Placeholder)</h4>
                        <p className="text-sm text-gray-500 mt-2">
                           History tracking feature is not yet fully implemented on the backend.
                           The current status is **{order.deliveryStatus}**.
                        </p>
                    </>
                ) : (
                    /* EDIT MODE (Form) */
                    <form onSubmit={handleSubmit}>
                        
                        <div className="input-group">
                            <label htmlFor="serialNumber">Serial Number (Unique):</label>
                            <input
                                type="text"
                                name="serialNumber"
                                id="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="orderDate">Order Date:</label>
                            <input
                                type="date"
                                name="orderDate"
                                id="orderDate"
                                value={formData.orderDate}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor="deliveryStatus">Delivery Status:</label>
                            <select
                                name="deliveryStatus"
                                id="deliveryStatus"
                                value={formData.deliveryStatus}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="owner">Owner:</label>
                            <select
                                name="owner"
                                id="owner"
                                value={formData.owner}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            >
                                {OWNER_OPTIONS.map(owner => (
                                    <option key={owner} value={owner}>{owner}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="notes">Notes (Status Change Reason - Optional):</label>
                            <input
                                type="text"
                                name="notes"
                                id="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="e.g., Customer called to confirm address"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex justify-between space-x-2 mt-4">
                            <button type="submit" className="action-btn save-btn w-1/2" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={() => setEditMode(false)} className="action-btn cancel-btn w-1/2" disabled={isSubmitting}>
                                Cancel Edit
                            </button>
                        </div>
                    </form>
                )}
            </div>
            
            {/* Custom Delete Confirmation Modal (Replaces window.confirm) */}
            {showConfirmDelete && (
                <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="modal-content bg-white p-6 rounded-lg shadow-2xl max-w-sm mx-4">
                        <h4 className="text-xl font-bold text-red-600 mb-4">Confirm Deletion</h4>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete order **{order.serialNumber}**? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowConfirmDelete(false)} 
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditOrderModal;
