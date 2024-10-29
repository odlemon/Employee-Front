import { BRN_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const branchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBranch: builder.mutation({
      query: (data) => ({
        url: `${BRN_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateBranch: builder.mutation({
      query: ({ id, data }) => ({
        url: `${BRN_URL}/update/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    

    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `${BRN_URL}/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getSingleBranch: builder.query({
        query: (id) => ({
          url: `${BRN_URL}/detail/${id}`,
          method: "GET",
          credentials: "include",
        }),
      }),

    getBranches: builder.query({
      query: () => ({
        url: `${BRN_URL}/get`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetBranchesQuery,
  useGetSingleBranchQuery,
} = branchApiSlice;
