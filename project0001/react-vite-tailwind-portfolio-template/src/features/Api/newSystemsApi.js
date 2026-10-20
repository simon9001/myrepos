import { apiSlice } from "./apiSlice";

export const membershipsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMembershipStatus: builder.query({
            query: () => "/memberships/status",
            providesTags: ["Memberships"],
        }),
        upgradeMembership: builder.mutation({
            query: (data) => ({
                url: "/memberships/upgrade",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Memberships"],
        }),
        getFarmerNetwork: builder.query({
            query: () => "/memberships/network",
        }),
        getMemberships: builder.query({
            query: (params) => ({
                url: "/memberships/all",
                params,
            }),
            providesTags: ["Memberships"],
        }),
    }),
});

export const {
    useGetMembershipStatusQuery,
    useUpgradeMembershipMutation,
    useGetFarmerNetworkQuery,
    useGetMembershipsQuery,
} = membershipsApi;

export const sponsorsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Sponsor application endpoints
        getSponsorApplication: builder.query({
            query: () => "/sponsors/my-application",
            providesTags: ["SponsorApplication"],
        }),
        applySponsor: builder.mutation({
            query: (data) => ({
                url: "/sponsors/apply",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["SponsorApplication"],
        }),
        getMySponsorship: builder.query({
            query: () => "/sponsors/my-sponsorship",
            providesTags: ["Sponsorship"],
        }),

        // Public endpoints
        getPublicSponsors: builder.query({
            query: () => "/sponsors/public-list",
            providesTags: ["PublicSponsors"],
        }),

        // Admin endpoints
        getAllSponsorApplications: builder.query({
            query: (status) => ({
                url: "/admin/sponsors/applications",
                params: status ? { status } : {},
            }),
            providesTags: ["SponsorApplications"],
        }),
        reviewSponsorApplication: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/sponsors/applications/${id}/review`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["SponsorApplications", "SponsorApplication"],
        }),
        createSponsorship: builder.mutation({
            query: (data) => ({
                url: "/admin/sponsors/sponsorships",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Sponsorships"],
        }),
        getAllSponsorships: builder.query({
            query: (params) => ({
                url: "/admin/sponsors/sponsorships",
                params,
            }),
            providesTags: ["Sponsorships"],
        }),
        updateSponsorshipStatus: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/sponsors/sponsorships/${id}/status`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Sponsorships", "Sponsorship", "PublicSponsors"],
        }),
    }),
});

export const {
    useGetSponsorApplicationQuery,
    useApplySponsorMutation,
    useGetMySponsorshipQuery,
    useGetPublicSponsorsQuery,
    useGetAllSponsorApplicationsQuery,
    useReviewSponsorApplicationMutation,
    useCreateSponsorshipMutation,
    useGetAllSponsorshipsQuery,
    useUpdateSponsorshipStatusMutation,
} = sponsorsApi;


export const marketApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMarketRequests: builder.query({
            query: (status) => ({
                url: "/market/requests",
                params: { status },
            }),
            providesTags: ["MarketRequests"],
        }),
        createMarketRequest: builder.mutation({
            query: (data) => ({
                url: "/market/requests",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MarketRequests"],
        }),
        submitSupplyOffer: builder.mutation({
            query: ({ requestId, data }) => ({
                url: `/market/requests/${requestId}/offers`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MarketRequests"],
        }),
        getRequestOffers: builder.query({
            query: (requestId) => `/market/requests/${requestId}/offers`,
        }),

        // New E-commerce & Auction Endpoints
        getPublicProducts: builder.query({
            query: (params) => ({
                url: "/market/products",
                params,
            }),
            providesTags: ["MarketProducts"],
        }),
        getProductDetails: builder.query({
            query: (id) => `/market/products/${id}`,
            providesTags: (result, error, id) => [{ type: "MarketProducts", id }],
        }),
        placeBid: builder.mutation({
            query: ({ id, amount }) => ({
                url: `/market/products/${id}/bid`,
                method: "POST",
                body: { amount },
            }),
            invalidatesTags: (result, error, { id }) => ["MarketBids", { type: "MarketProducts", id }],
        }),
        purchaseDirect: builder.mutation({
            query: (data) => ({
                url: "/market/products/purchase",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MarketOrders", "MarketProducts"],
        }),
        getMyOrders: builder.query({
            query: () => "/market/my-orders",
            providesTags: ["MarketOrders"],
        }),
        getMyBids: builder.query({
            query: () => "/market/my-bids",
            providesTags: ["MarketBids"],
        }),

        // Admin Market Management
        getAllAdminProducts: builder.query({
            query: () => "/admin/market/products",
            providesTags: ["AdminMarketProducts"],
        }),
        createAdminProduct: builder.mutation({
            query: (data) => ({
                url: "/admin/market/products",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["AdminMarketProducts", "MarketProducts"],
        }),
    }),
});

export const {
    useGetMarketRequestsQuery,
    useCreateMarketRequestMutation,
    useSubmitSupplyOfferMutation,
    useGetRequestOffersQuery,
    useGetPublicProductsQuery,
    useGetProductDetailsQuery,
    usePlaceBidMutation,
    usePurchaseDirectMutation,
    useGetMyOrdersQuery,
    useGetMyBidsQuery,
    useGetAllAdminProductsQuery,
    useCreateAdminProductMutation,
} = marketApi;

