import { REV_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const branchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    setRevenue: builder.mutation({
      query: (data) => ({
        url: `${REV_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateRevenue: builder.mutation({
      query: ({ id, data }) => ({
        url: `${REV_URL}/update/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `${REV_URL}/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getSingleBranch: builder.query({
        query: (id) => ({
          url: `${REV_URL}/detail/${id}`,
          method: "GET",
          credentials: "include",
        }),
      }),

    getRevenue: builder.query({
      query: () => ({
        url: `${REV_URL}/all`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useSetRevenueMutation,
  useUpdateRevenueMutation,
  useDeleteBranchMutation,
  useGetRevenueQuery,
  useGetSingleBranchQuery,
} = branchApiSlice;
