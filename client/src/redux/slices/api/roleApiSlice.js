import { ROLE_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRole: builder.mutation({
      query: (data) => ({
        url: `${ROLE_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateRole: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ROLE_URL}/update/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `${ROLE_URL}/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getRoles: builder.query({
      query: (branchId) => ({
        url: `${ROLE_URL}/get`,
        method: "POST",
        credentials: "include",
        body: { branchId },
      }),
    }),

    getAllRoles: builder.query({
      query: () => ({
        url: `${ROLE_URL}/all`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useGetAllRolesQuery,
} = roleApiSlice;
