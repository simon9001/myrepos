import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Star, CreditCard, Loader2 } from 'lucide-react';
import { useGetMembershipStatusQuery, useUpgradeMembershipMutation } from '../../features/Api/newSystemsApi';

const MembershipSection = () => {
    const { data, isLoading, refetch } = useGetMembershipStatusQuery();
    const [upgradeMembership, { isLoading: isUpgrading }] = useUpgradeMembershipMutation();
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState(null);

    const membership = data?.membership;
    const isPremium = membership?.tier === 'premium' && membership?.payment_status === 'paid';

    const handleUpgrade = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            const res = await upgradeMembership({ tier: 'premium', payment_phone: phone }).unwrap();
            setMessage({ type: 'success', text: `Upgrade initiated! Checking payment on ${res.daraja_payload.PhoneNumber}...` });
            // In a real app, you'd poll for status or wait for callback
            setTimeout(() => refetch(), 5000);
        } catch (err) {
            setMessage({ type: 'error', text: err.data?.error || 'Upgrade failed' });
        }
    };

    if (isLoading) return <div className="p-4"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        Membership Status
                        {isPremium && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">Premium</span>}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {isPremium
                            ? `Your premium access is active until ${new Date(membership.expiry_date).toLocaleDateString()}`
                            : 'Upgrade to unlock full potential'}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremium ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Shield className="w-6 h-6" />
                </div>
            </div>

            {!isPremium ? (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Why Go Premium?</h3>
                        <ul className="space-y-3">
                            {[
                                'Unlimited Active Listings (Free: max 3)',
                                'Priority Ranking in Marketplace',
                                '"Verified Farmer" Badge of Trust',
                                'Reduced 5% Commission (Free: 10%)',
                                'Access to Farmer Network Directory',
                                'Pre-harvest Contract Opportunities'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-border/50">
                        <div className="text-center mb-6">
                            <span className="text-3xl font-bold text-foreground">Ksh 1,000</span>
                            <span className="text-muted-foreground">/ year</span>
                        </div>

                        <form onSubmit={handleUpgrade} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">M-Pesa Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="07..."
                                    className="w-full rounded-xl border border-border px-4 py-2 bg-white dark:bg-gray-900"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpgrading}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUpgrading ? <Loader2 className="animate-spin w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                Pay & Upgrade
                            </button>

                            {message && (
                                <p className={`text-xs text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {message.text}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                    <div className="flex items-start gap-4">
                        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                        <div>
                            <h3 className="font-bold text-lg text-foreground">You're a Premium Member!</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enjoy your exclusive benefits. Visit the Network tab to connect with other farmers or check the Market tab for priority requests.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipSection;
