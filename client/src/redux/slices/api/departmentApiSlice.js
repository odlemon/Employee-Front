import { DEP_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDepartment: builder.mutation({
      query: (data) => ({
        url: `${DEP_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateDepartment: builder.mutation({
      query: ({ id, data }) => ({
        url: `${DEP_URL}/update/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `${DEP_URL}/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getDepartments: builder.query({
      query: (branchId) => ({
        url: `${DEP_URL}/get`,
        method: "POST",
        body: { branchId },
        credentials: "include",
      }),
    }),

    getAllDepartments: builder.query({
      query: () => ({
        url: `${DEP_URL}/all`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
  useGetAllDepartmentsQuery
} = departmentApiSlice;
