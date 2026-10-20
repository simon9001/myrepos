import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Plus,
    MapPin,
    Clock,
    Box,
    Loader2
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import {
    useGetMarketRequestsQuery,
    useCreateMarketRequestMutation,
    useSubmitSupplyOfferMutation
} from '../../features/Api/newSystemsApi';

const MarketSection = () => {
    const user = useSelector(selectCurrentUser);
    const isBuyer = user?.role === 'buyer';
    const isFarmer = user?.role === 'farmer';

    const [isCreatingRequest, setIsCreatingRequest] = useState(false);

    // Fetch requests
    const { data, isLoading } = useGetMarketRequestsQuery(isBuyer ? undefined : 'open');
    const requests = data?.requests || [];

    const [createRequest, { isLoading: isCreating }] = useCreateMarketRequestMutation();

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await createRequest({
                crop_type: formData.get('crop_type'),
                quantity: formData.get('quantity'),
                location: formData.get('location'),
                timeline: formData.get('timeline'),
                budget_range: formData.get('budget_range'),
                quality_requirements: formData.get('quality_requirements'),
            }).unwrap();
            setIsCreatingRequest(false);
        } catch (err) {
            console.error('Failed to create request', err);
        }
    };

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">
                    {isBuyer ? 'My Market Requests' : 'Open Market Requests'}
                </h2>
                {isBuyer && (
                    <button
                        onClick={() => setIsCreatingRequest(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-green-700 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Post Request
                    </button>
                )}
            </div>

            {/* Create Request Modal / Form */}
            {isCreatingRequest && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-border/50 shadow-lg mb-8">
                    <h3 className="font-bold text-lg mb-4">Post a New Requirement</h3>
                    <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="crop_type" placeholder="Crop Type (e.g. Tomatoes)" className="p-3 rounded-xl border border-border bg-transparent" required />
                        <input name="quantity" placeholder="Quantity (e.g. 500kg)" className="p-3 rounded-xl border border-border bg-transparent" required />
                        <input name="location" placeholder="Delivery Location" className="p-3 rounded-xl border border-border bg-transparent" required />
                        <input name="timeline" placeholder="Timeline (e.g. Next Week)" className="p-3 rounded-xl border border-border bg-transparent" required />
                        <input name="budget_range" placeholder="Budget (Optional)" className="p-3 rounded-xl border border-border bg-transparent" />
                        <textarea name="quality_requirements" placeholder="Quality Requirements..." className="md:col-span-2 p-3 rounded-xl border border-border bg-transparent h-24" />

                        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setIsCreatingRequest(false)} className="px-4 py-2 text-sm">Cancel</button>
                            <button type="submit" disabled={isCreating} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold">
                                {isCreating ? 'Posting...' : 'Post Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Requests List */}
            <div className="grid gap-4">
                {requests.length > 0 ? (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-foreground">{req.crop_type}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider 
                                            ${req.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1"><Box className="w-3 h-3" /> {req.quantity}</div>
                                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</div>
                                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.timeline}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isFarmer && req.status === 'open' && (
                                        <button className="px-5 py-2 bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-200 dark:border-green-900/30 rounded-xl font-bold text-xs hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
                                            Make Offer
                                        </button>
                                    )}
                                    {isBuyer && (
                                        <button className="px-5 py-2 bg-gray-50 dark:bg-gray-800 text-foreground border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            View Offers
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p>No market requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketSection;
