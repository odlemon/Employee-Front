import { KPI_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const KPIApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createKPI: builder.mutation({
      query: (data) => ({
        url: `${KPI_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    updateKPI: builder.mutation({
      query: ({ id, data }) => ({
        url: `${KPI_URL}/update/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    deleteKPI: builder.mutation({
      query: (id) => ({
        url: `${KPI_URL}/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getAllKPI: builder.query({
        query: () => ({
          url: `${KPI_URL}/all`,
          method: "GET",
          credentials: "include",
        }),
      }),

    getKPI: builder.query({
      query: (branchId) => ({
        url: `${KPI_URL}/get`,
        method: "POST",
        body: { branchId },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateKPIMutation,
  useUpdateKPIMutation,
  useDeleteKPIMutation,
  useGetKPIQuery,
  useGetAllKPIQuery,
} = KPIApiSlice;
