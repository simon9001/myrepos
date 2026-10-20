export const getFieldStatus = (field) => {
    if (field.stage === 'Harvested') return 'Completed';

    if (field.stage === 'Planted' || field.stage === 'Growing') {
        const lastUpdated = new Date(field.last_updated);
        const today = new Date();
        const diffTime = Math.abs(today - lastUpdated);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 7) {
            return 'At Risk';
        }
    }
    
    return 'Active';
};
