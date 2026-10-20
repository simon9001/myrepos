import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Helper to interact with localStorage
const getFieldsFromStorage = () => {
    const fields = localStorage.getItem('fields');
    return fields ? JSON.parse(fields) : [];
};

const saveFieldsToStorage = (fields) => {
    localStorage.setItem('fields', JSON.stringify(fields));
};

// Initial mock data
if (!localStorage.getItem('fields')) {
    saveFieldsToStorage([
        {
            field_id: 1,
            name: 'North Acre',
            crop_type: 'Corn',
            planting_date: '2026-03-01',
            stage: 'Planted',
            agent_id: 2, // Assuming agent has ID 2
            notes: 'Initial planting complete. Soil moisture is good.',
            last_updated: '2026-03-01'
        },
        {
            field_id: 2,
            name: 'South Field',
            crop_type: 'Wheat',
            planting_date: '2026-02-15',
            stage: 'Growing',
            agent_id: 2,
            notes: 'Crop is growing well. Applied fertilizer last week.',
            last_updated: '2026-04-10'
        },
        {
            field_id: 3,
            name: 'East Meadow',
            crop_type: 'Soybeans',
            planting_date: '2025-10-01',
            stage: 'Harvested',
            agent_id: null,
            notes: 'Harvested 500 bushels. Yield was below average due to drought.',
            last_updated: '2025-11-20'
        }
    ]);
}

export const FieldApi = createApi({
    reducerPath: 'fieldApi',
    // We use a dummy baseQuery because we are going to use queryFn for mocking
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    tagTypes: ['Fields'],
    endpoints: (builder) => ({
        getAllFields: builder.query({
            queryFn: () => {
                const fields = getFieldsFromStorage();
                return { data: fields };
            },
            providesTags: ['Fields'],
        }),
        getFieldsByAgentId: builder.query({
            queryFn: (agentId) => {
                const fields = getFieldsFromStorage().filter(f => f.agent_id === agentId);
                return { data: fields };
            },
            providesTags: ['Fields'],
        }),
        createField: builder.mutation({
            queryFn: (newField) => {
                const fields = getFieldsFromStorage();
                const field = {
                    ...newField,
                    field_id: Date.now(),
                    stage: newField.stage || 'Planted',
                    last_updated: new Date().toISOString().split('T')[0],
                    notes: newField.notes || ''
                };
                fields.push(field);
                saveFieldsToStorage(fields);
                return { data: { message: 'Field created successfully', field } };
            },
            invalidatesTags: ['Fields'],
        }),
        assignField: builder.mutation({
            queryFn: ({ field_id, agent_id }) => {
                const fields = getFieldsFromStorage();
                const fieldIndex = fields.findIndex(f => f.field_id === field_id);
                if (fieldIndex !== -1) {
                    fields[fieldIndex].agent_id = agent_id;
                    saveFieldsToStorage(fields);
                    return { data: { message: 'Field assigned successfully', field: fields[fieldIndex] } };
                }
                return { error: { status: 404, data: 'Field not found' } };
            },
            invalidatesTags: ['Fields'],
        }),
        updateFieldStageAndNotes: builder.mutation({
            queryFn: ({ field_id, stage, notes }) => {
                const fields = getFieldsFromStorage();
                const fieldIndex = fields.findIndex(f => f.field_id === field_id);
                if (fieldIndex !== -1) {
                    fields[fieldIndex].stage = stage;
                    fields[fieldIndex].notes = notes;
                    fields[fieldIndex].last_updated = new Date().toISOString().split('T')[0];
                    saveFieldsToStorage(fields);
                    return { data: { message: 'Field updated successfully', field: fields[fieldIndex] } };
                }
                return { error: { status: 404, data: 'Field not found' } };
            },
            invalidatesTags: ['Fields'],
        })
    }),
});
