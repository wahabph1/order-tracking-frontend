import React, { useState } from 'react';

const deliveryStatuses = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];

const EditOrderModal = ({ API_URL, order, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        serialNumber: order.serialNumber,
        owner: order.owner,
        orderDate: new Date(order.orderDate).toISOString().substring(0, 10),
        deliveryStatus: order.deliveryStatus,
        notes: '', // Notes for history tracking
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare the body, excluding empty notes if status didn't change
        const updateBody = {
            serialNumber: formData.serialNumber,
            owner: formData.owner,
            orderDate: formData.orderDate,
            deliveryStatus: formData.deliveryStatus,
        };

        // Only include notes if the status actually changed
        if (formData.deliveryStatus !== order.deliveryStatus) {
            updateBody.notes = formData.notes || `Status manually changed to ${formData.deliveryStatus}`;
        }

        try {
            const response = await fetch(`${API_URL}/${order._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateBody),
            });

            const result = await response.json();

            if (!response.ok) {
                 const errorText = result.message || 'Order update nahi ho paya.';
                 throw new Error(errorText);
            }

            onUpdate(); // Table ko refresh karna
        } catch (e) {
            console.error('Update error:', e);
            setError(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h3>Order Edit Karein ({order.serialNumber})</h3>
                
                <form onSubmit={handleSave}>
                    <div className="input-group">
                        <label>Serial Number</label>
                        <input
                            type="text"
                            name="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Owner/Client</label>
                        <input
                            type="text"
                            name="owner"
                            value={formData.owner}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Order Date</label>
                        <input
                            type="date"
                            name="orderDate"
                            value={formData.orderDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Delivery Status</label>
                        <select
                            name="deliveryStatus"
                            value={formData.deliveryStatus}
                            onChange={handleChange}
                            required
                        >
                            {deliveryStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Show Notes only if status has changed for history tracking */}
                    {formData.deliveryStatus !== order.deliveryStatus && (
                        <div className="input-group">
                            <label>Status Change Notes (Optional)</label>
                            <input
                                type="text"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Status change ka reason likhein..."
                            />
                        </div>
                    )}
                    
                    {error && <div className="error-message p-3 text-sm text-center my-2">{error}</div>}

                    <button type="submit" className="action-btn save-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Changes Save Karein'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditOrderModal;