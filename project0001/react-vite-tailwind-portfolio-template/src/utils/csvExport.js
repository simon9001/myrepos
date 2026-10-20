/**
 * Convert JSON data to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Optional array of column names to include
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, columns = null) => {
    if (!data || data.length === 0) {
        return '';
    }

    // Get all unique keys from the data
    const allKeys = new Set();
    data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => {
                // Skip nested objects and arrays for simplicity
                if (typeof item[key] !== 'object' || item[key] === null) {
                    allKeys.add(key);
                }
            });
        }
    });

    // Use provided columns or all keys
    const headers = columns || Array.from(allKeys);

    // Create CSV header row
    const csvHeader = headers.map(escapeCSVValue).join(',');

    // Create CSV data rows
    const csvRows = data.map(item => {
        return headers.map(header => {
            const value = item[header];
            return escapeCSVValue(value);
        }).join(',');
    });

    return [csvHeader, ...csvRows].join('\n');
};

/**
 * Escape CSV value to handle special characters
 * @param {*} value - Value to escape
 * @returns {string} Escaped value
 */
const escapeCSVValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    // If the value contains comma, newline, or quotes, wrap it in quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        // Escape quotes by doubling them
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Name of the file
 */
export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Flatten nested objects for CSV export
 * @param {Array} data - Array of objects with nested data
 * @returns {Array} Flattened array of objects
 */
export const flattenDataForCSV = (data) => {
    return data.map(item => {
        const flattened = {};

        Object.keys(item).forEach(key => {
            const value = item[key];

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // For nested objects, create dot notation keys
                Object.keys(value).forEach(nestedKey => {
                    if (typeof value[nestedKey] !== 'object' || value[nestedKey] === null) {
                        flattened[`${key}.${nestedKey}`] = value[nestedKey];
                    }
                });
            } else if (Array.isArray(value)) {
                // For arrays, join them as comma-separated string
                flattened[key] = value.map(v =>
                    typeof v === 'object' ? JSON.stringify(v) : v
                ).join('; ');
            } else {
                flattened[key] = value;
            }
        });

        return flattened;
    });
};

/**
 * Export bookings data to CSV
 * @param {Array} bookings - Array of booking objects
 * @param {string} filename - Optional filename
 */
export const exportBookingsToCSV = (bookings, filename = `bookings_${new Date().toISOString().split('T')[0]}.csv`) => {
    const flattenedBookings = bookings.map(booking => ({
        id: booking.id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        meeting_link: booking.meeting_link || 'N/A',
        user_name: booking.user?.name || 'N/A',
        user_email: booking.user?.email || 'N/A',
        user_phone: booking.user?.phone || 'N/A',
        service_name: booking.service?.name || 'N/A',
        service_price: booking.service?.price || 'N/A',
        payment_amount: booking.payments?.[0]?.amount || 'N/A',
        payment_status: booking.payments?.[0]?.status || 'N/A',
        payment_method: booking.payments?.[0]?.mpesa_receipt_number ? 'M-Pesa' : 'N/A',
        created_at: booking.created_at,
        updated_at: booking.updated_at,
    }));

    const csvContent = convertToCSV(flattenedBookings);
    downloadCSV(csvContent, filename);
};

/**
 * Export users data to CSV
 * @param {Array} users - Array of user objects
 * @param {string} filename - Optional filename
 */
export const exportUsersToCSV = (users, filename = `users_${new Date().toISOString().split('T')[0]}.csv`) => {
    const flattenedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
    }));

    const csvContent = convertToCSV(flattenedUsers);
    downloadCSV(csvContent, filename);
};

/**
 * Export services data to CSV
 * @param {Array} services - Array of service objects
 * @param {string} filename - Optional filename
 */
export const exportServicesToCSV = (services, filename = `services_${new Date().toISOString().split('T')[0]}.csv`) => {
    const flattenedServices = services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        crops: service.service_crops?.map(c => c.name).join('; ') || 'N/A',
        created_at: service.created_at,
        updated_at: service.updated_at,
    }));

    const csvContent = convertToCSV(flattenedServices);
    downloadCSV(csvContent, filename);
};
