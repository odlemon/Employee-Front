import React, { useState } from "react";
import { useGetSingleBranchQuery } from "../redux/slices/api/branchApiSlice";
import { Loading, Button } from "../components";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { MdOutlineEdit } from "react-icons/md";
import { toast } from "sonner";
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from "../redux/slices/api/roleApiSlice";
import {
  useGetDepartmentsQuery,
  useDeleteDepartmentMutation,
} from "../redux/slices/api/departmentApiSlice";
import { useGetKPIQuery, useDeleteKPIMutation } from "../redux/slices/api/kpiApiSlice";
import AddDepartmentModal from "./AddDepartment";
import AddRoleModal from "./AddRoleModal";
import AddKPIModal from "./AddKPIModal";
import EditKPIModal from "./EditKPIModal";
import EditRoleModal from "./EditRoleModal";
import EditDepartmentModal from "./EditDepartmentModal";
import { usePermissions } from "../utils/PermissionsContext";

const BranchDetail = ({ branchId, onClose }) => {
  const { data, isLoading, error } = useGetSingleBranchQuery(branchId);
  const { data: departments = [], isLoading: isLoadingDepartments, refetch: refetchDepartments } = useGetDepartmentsQuery(branchId);
  const { data: roles = [], isLoading: isLoadingRoles, refetch: refetchRoles } = useGetRolesQuery(branchId);
  const { data: kpis = [], isLoading: isLoadingKPIs, refetch: refetchKPIs } = useGetKPIQuery(branchId);
  const [openAddDepartmentModal, setOpenAddDepartmentModal] = useState(false);
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [openEditKPIModal, setOpenEditKPIModal] = useState(false);
  const [openEditDepartmentModal, setOpenEditDepartmentModal] = useState(false);
  const [openEditRoleModal, setOpenEditRoleModal] = useState(false);
  const [openAddKPIModal, setOpenAddKPIModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteRole] = useDeleteRoleMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [deleteKPI] = useDeleteKPIMutation();
  const { permissions } = usePermissions();

  const deleteClick = async (id, type) => {
    try {
      let res;
      if (type === "role") {
        res = await deleteRole(id);
        refetchRoles();
      } else if (type === "department") {
        res = await deleteDepartment(id);
        refetchDepartments();
      } else if (type === "kpi") {
        res = await deleteKPI(id);
        refetchKPIs();
      }

      toast.success(res?.data?.message);
    } catch (error) {
      console.log("Error during deletion:", error);
      toast.error(error?.data?.message || error.error);
    }
  };


  const handleAddDepartment = () => {
    setOpenAddDepartmentModal(true);
  };

  const handleAddRole = () => {
    setOpenAddRoleModal(true);
  };

  const handleAddKPI = () => {
    setOpenAddKPIModal(true);
  };

  const handleEditKPI = (kpi) => {
    setSelectedKPI(kpi);
    setOpenEditKPIModal(true);
};

const handleEditRole = (role) => {
  setSelectedRole(role);
  setOpenEditRoleModal(true);
};

const handleEditDepartment = (department) => {
  setSelectedDepartment(department);
  setOpenEditDepartmentModal(true);
};


  if (isLoading || isLoadingDepartments || isLoadingRoles || isLoadingKPIs) return <Loading />;

  if (error) {
    console.error("Error fetching branch details:", error);
    return <div>Error loading branch details</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const branch = data;

  return (
    <div className="w-full flex flex-col gap-3 mb-4 px-10 py-8 bg-white shadow rounded-md relative">
      <button className="text-red-500 hover:text-red-700 ml-auto" onClick={onClose}>
        <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
      <h1 className="text-2xl text-gray-600 font-bold mb-4">{branch.name || "Branch Name Not Available"}</h1>

      <div className="flex flex-col gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl text-gray-600 font-semibold">Departments</h2>
            {permissions.includes("can create departments") && (
            <Button
              label="Add Department"
              className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
              onClick={handleAddDepartment}
            >
              <IoMdAdd className="mr-2" />
            </Button>
            )}
          </div>
          {permissions.includes("can view departments") && (
            <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-100">
                <th className="w-1/3 p-3 text-left font-semibold border-b border-gray-300">Name</th>
                <th className="w-1/2 p-3 text-left font-semibold border-b border-gray-300">Description</th>
                <th className="w-1/6 p-3 text-right font-semibold border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map((dept, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 align-middle truncate">{dept.name}</td>
                    <td className="p-3 align-middle truncate">{dept.description}</td>
                    <td className="p-3 align-middle text-right">
                    <Button
                     icon={<MdOutlineEdit className="text-lg" />}
                     className="inline-flex items-center justify-center bg-green-600 text-white rounded-md p-2 hover:bg-green-500 transition-colors mr-2"
                     onClick={() => handleEditDepartment(dept)}
                   />
                      <Button
                        icon={<IoMdTrash className="text-lg" />}
                        className="inline-flex items-center justify-center bg-red-600 text-white rounded-md p-2 hover:bg-red-500 transition-colors"
                        onClick={() => deleteClick(dept._id, 'department')}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-3 text-center text-gray-500">No departments available</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl text-gray-600 font-semibold">Roles</h2>
            {permissions.includes("can create roles") && (
            <Button
              label="Add Role"
              className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
              onClick={handleAddRole}
            >
              <IoMdAdd className="mr-2" />
            </Button>
            )}
          </div>
          {permissions.includes("can view roles") && (
  <table className="w-full border-collapse">
  <thead>
    <tr className="bg-gray-100">
      <th className="p-3 text-left font-semibold border-b border-gray-300 w-1/3">Name</th>
      <th className="p-3 text-left font-semibold border-b border-gray-300 w-1/2">Description</th>
      <th className="p-3 text-right font-semibold border-b border-gray-300 w-1/6">Actions</th>
    </tr>
  </thead>
  <tbody>
    {roles.length > 0 ? (
      roles.map((role, index) => (
        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="p-3 align-middle">{role.name}</td>
          <td className="p-3 align-middle">{role.description}</td>
          <td className="p-3 align-middle text-right">
          <Button
                     icon={<MdOutlineEdit className="text-lg" />}
                     className="inline-flex items-center justify-center bg-green-600 text-white rounded-md p-2 hover:bg-green-500 transition-colors mr-2"
                     onClick={() => handleEditRole(role)}
                   />
            <Button
              icon={<IoMdTrash className="text-lg" />}
              className="inline-flex items-center justify-center bg-red-600 text-white rounded-md p-2 hover:bg-red-500 transition-colors"
              onClick={() => deleteClick(role._id, 'role')}
            />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="3" className="p-3 text-center text-gray-500">No roles available</td>
      </tr>
    )}
  </tbody>
</table>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl text-gray-600 font-semibold">KPIs</h2>
            {permissions.includes("can create KPIs") && (
            <Button
              label="Add KPI"
              className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
              onClick={handleAddKPI}
            >
              <IoMdAdd className="mr-2" />
            </Button>
            )}
          </div>
          {permissions.includes("can view KPIs") && (
         <table className="w-full border-collapse">
         <thead>
           <tr className="bg-gray-100">
             <th className="p-3 text-left font-semibold border-b border-gray-300 w-2/5">Name</th>
             <th className="p-3 text-left font-semibold border-b border-gray-300 w-2/5">Type</th>
             <th className="p-3 text-right font-semibold border-b border-gray-300 w-1/5">Actions</th>
           </tr>
         </thead>
         <tbody>
           {kpis.length > 0 ? (
             kpis.map((kpi, index) => (
               <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                 <td className="p-3 align-middle">{kpi.name}</td>
                 <td className="p-3 align-middle">{kpi.type}</td>
                 <td className="p-3 align-middle text-right">
                   <Button
                     icon={<MdOutlineEdit className="text-lg" />}
                     className="inline-flex items-center justify-center bg-green-600 text-white rounded-md p-2 hover:bg-green-500 transition-colors mr-2"
                     onClick={() => handleEditKPI(kpi)}
                   />
                   <Button
                     icon={<IoMdTrash className="text-lg" />}
                     className="inline-flex items-center justify-center bg-red-600 text-white rounded-md p-2 hover:bg-red-500 transition-colors"
                     onClick={() => deleteClick(kpi._id, 'kpi')}
                   />
                 </td>
               </tr>
             ))
           ) : (
             <tr>
               <td colSpan="3" className="p-3 text-center text-gray-500">No KPIs available</td>
             </tr>
           )}
         </tbody>
       </table>
          )}
        </div>
      </div>

      <AddDepartmentModal open={openAddDepartmentModal} setOpen={setOpenAddDepartmentModal} branchId={branchId} refetch={refetchDepartments} />
      <AddRoleModal open={openAddRoleModal} setOpen={setOpenAddRoleModal} branchId={branchId} refetch={refetchRoles} />
      <AddKPIModal open={openAddKPIModal} setOpen={setOpenAddKPIModal} branchId={branchId} refetch={refetchKPIs} />
      <EditKPIModal open={openEditKPIModal} setOpen={setOpenEditKPIModal} kpi={selectedKPI} refetch={refetchKPIs} />
      <EditDepartmentModal 
        open={openEditDepartmentModal} 
        setOpen={setOpenEditDepartmentModal} 
        name={selectedDepartment?.name} 
        description={selectedDepartment?.description} 
        id={selectedDepartment?._id} 
        refetch={refetchDepartments} 
      />

      <EditRoleModal
      open={openEditRoleModal}
      setOpen={setOpenEditRoleModal}
      role={{
        name: selectedRole?.name,
        description: selectedRole?.description,
        permissions: selectedRole?.permissions,
        id: selectedRole?._id, // Assuming permissions are part of the role object
      }}
      refetch={refetchRoles}
    />
    </div>
  );
};

export default BranchDetail;
