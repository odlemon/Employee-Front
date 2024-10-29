import { REV_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const branchRevenueApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBranchRev: builder.mutation({
      query: (data) => ({
        url: `${REV_URL}/branch-revenue`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateBranchRev: builder.mutation({
      query: ({ revenueId, data }) => ({
        url: `${REV_URL}/update/${revenueId}`, // Only revenueId in the URL
        method: "PUT",
        body: data, // The body includes branchId, target, and achieved
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    


    getBranchRevs: builder.query({
      query: () => ({
        url: `${REV_URL}/all`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useUpdateBranchRevMutation,
  useCreateBranchRevMutation,
  useGetBranchRevsQuery,
} = branchRevenueApiSlice;
