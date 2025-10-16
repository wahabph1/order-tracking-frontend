import React, { useState } from 'react';

// Status Messages component to avoid using alert()
const StatusMessage = ({ type, message }) => {
    const className = type === 'success' ? 'success-message' : 'error-message';
    return (
        <div className={`form-message ${className}`}>
            {message}
        </div>
    );
};

const OrderForm = ({ API_URL, onOrderAdded }) => {
    const [formData, setFormData] = useState({
        serialNumber: '',
        owner: '',
        orderDate: new Date().toISOString().substring(0, 10), // Default to today
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsSubmitting(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorText = result.message || 'Order add nahi ho paya.';
                throw new Error(errorText);
            }

            setMessage({ text: 'Order safaltapoorvak add ho gaya!', type: 'success' });
            
            // Form ko reset karna
            setFormData({
                serialNumber: '',
                owner: '',
                orderDate: new Date().toISOString().substring(0, 10),
            });
            
            onOrderAdded(); // Table ko refresh karna
        } catch (error) {
            console.error('Order submission error:', error);
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="order-form-container">
            <h3>Naya Order Add Karein</h3>
            <form className="order-form" onSubmit={handleSubmit}>
                <div className="input-row">
                    <div className="form-group">
                        <label htmlFor="serialNumber">Serial Number</label>
                        <input
                            type="text"
                            id="serialNumber"
                            name="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="owner">Owner/Client</label>
                        <input
                            type="text"
                            id="owner"
                            name="owner"
                            value={formData.owner}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="orderDate">Order Date</label>
                        <input
                            type="date"
                            id="orderDate"
                            name="orderDate"
                            value={formData.orderDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Order Submit Karein'}
                </button>
            </form>
            {message.text && <StatusMessage type={message.type} message={message.text} />}
        </div>
    );
};

export default OrderForm;