import React from 'react';
import { Loader2, User, Phone, Mail } from 'lucide-react';
import { useGetMembershipStatusQuery, useGetFarmerNetworkQuery } from '../../features/Api/newSystemsApi';
import MembershipSection from './MembershipSection';

const NetworkSection = () => {
    const { data: memberData, isLoading: isMemberLoading } = useGetMembershipStatusQuery();

    const membership = memberData?.membership;
    const isPremium = membership?.tier === 'premium' && membership?.payment_status === 'paid';

    // Only fetch network if premium
    const { data: networkData, isLoading: isNetworkLoading } = useGetFarmerNetworkQuery(undefined, {
        skip: !isPremium
    });

    if (isMemberLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    if (!isPremium) {
        return (
            <div className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl text-center">
                    <p className="font-semibold text-amber-800 dark:text-amber-500">
                        The Farmer Network is a Premium Feature
                    </p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-600 mt-1">
                        Connect with other successful farmers, share insights, and grow together.
                    </p>
                </div>
                <MembershipSection />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Farmer Network</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    Premium Access
                </span>
            </div>

            {isNetworkLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : networkData?.farmers?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {networkData.farmers.map((farmer) => (
                        <div key={farmer.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 font-bold text-xl">
                                    {farmer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{farmer.name}</h3>
                                    <p className="text-xs text-muted-foreground">Premium Farmer</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {farmer.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        {farmer.email}
                                    </div>
                                )}
                                {farmer.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        {farmer.phone}
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-4 py-2 border border-green-200 dark:border-green-900 text-green-600 rounded-xl text-sm font-semibold hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                                Send Message
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No other farmers found in the network yet.</p>
                </div>
            )}
        </div>
    );
};

export default NetworkSection;
