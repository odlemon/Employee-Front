import React, { useState, useEffect } from "react";
import { Button, ModalWrapper } from "../components";
import { useUpdateRoleMutation } from "../redux/slices/api/roleApiSlice";
import { toast } from "sonner";
import styles from '../pages/styles/RoleModal.module.css';

const EditRoleModal = ({ open, setOpen, branchId, refetch, role }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState([
    // Organisation Permissions
    { name: "can access organisation dashboard", value: false },
    { name: "can set organisation objective", value: false },
    { name: "can update branch progress", value: false },

    // Tasks Permissions
    { name: "can create tasks", value: false },
    { name: "can duplicate task", value: false },
    { name: "can add task activity", value: false },
    { name: "can view all tasks", value: false },
    { name: "can view tasks", value: false },
    { name: "can view task details", value: false },
    { name: "can evaluate performance", value: false },
    { name: "can create subtask", value: false },
    { name: "can update task", value: false },
    { name: "can change task stage", value: false },
    { name: "can trash task", value: false },
    { name: "can delete task", value: false },
  
    // Branches Permissions
    { name: "can create branches", value: false },
    { name: "can view branches", value: false },
    { name: "can view all branches", value: false },
    { name: "can view branch details", value: false },
    { name: "can update branches", value: false },
    { name: "can delete branches", value: false },
  
    // Departments Permissions
    { name: "can create departments", value: false },
    { name: "can view departments", value: false },
    { name: "can view all departments", value: false },
    { name: "can view department details", value: false },
    { name: "can update departments", value: false },
    { name: "can delete departments", value: false },
  
    // KPIs Permissions
    { name: "can create KPIs", value: false },
    { name: "can view KPIs", value: false },
    { name: "can view all KPIs", value: false },
    { name: "can view KPI details", value: false },
    { name: "can update KPIs", value: false },
    { name: "can delete KPIs", value: false },
  
    // Roles Permissions
    { name: "can create roles", value: false },
    { name: "can view roles", value: false },
    { name: "can view all roles", value: false },
    { name: "can view role details", value: false },
    { name: "can update roles", value: false },
    { name: "can delete roles", value: false },
  
    // Team List Permissions
    { name: "can view team list", value: false },
  
    // Additional Permissions
    { name: "can view dashboard", value: false },
    { name: "assess individual performance", value: false },
    { name: "delete objectives", value: false },
    { name: "modify objectives", value: false },
    { name: "view overall performance", value: false },
    { name: "change objective status", value: false }
  ]);
  
  const [updateRole, { isLoading }] = useUpdateRoleMutation();

  const handlePermissionChange = (index) => {
    const updatedPermissions = [...permissions];
    updatedPermissions[index].value = !updatedPermissions[index].value;
    setPermissions(updatedPermissions);
  };
  console.log("Role received:", role);
  const roleId = role?.id; 
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
  
    const selectedPermissions = permissions
      .filter((perm) => perm.value)
      .map((perm) => ({ name: perm.name, value: perm.value }));
  
    console.log("Submitting role update with data:", { id: roleId, name, permissions: selectedPermissions, description });
  
    try {
      await updateRole({ 
        id: roleId, 
        data: { 
          name, 
          permissions: selectedPermissions, 
          description, 
          branchId 
        } 
      }).unwrap();
      
      toast.success("Role updated successfully");
      setOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPermissions(permissions.map(perm => ({ ...perm, value: false })));
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  useEffect(() => {
    if (open) {
      // Populate form with role data if available
      if (role) {
        setName(role.name);
        setDescription(role.description);
        const updatedPermissions = permissions.map(perm => ({
          ...perm,
          value: role.permissions?.some(rPerm => rPerm.name === perm.name) || false
        }));
        setPermissions(updatedPermissions);
      } else {
        resetForm(); // Reset the form if no role is passed
      }
    }
  }, [open, role]);

  return (
    <ModalWrapper open={open} setOpen={setOpen} title="Edit Role" className={`w-3/4 max-w-4xl ${styles.modal}`}>
      <div className="relative">
        <button
          className={`absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200 ${styles.modalCloseButton}`}
          onClick={handleClose}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
  
        <div className={`p-6 space-y-6 ${styles.modalContent}`}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${styles.modalInput}`}
              required
              placeholder="Enter role name"
            />
          </div>
  
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${styles.modalInput}`}
              rows="3"
              placeholder="Enter role description"
            ></textarea>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions:</label>
            <div className={`grid grid-cols-2 gap-4 ${styles.modalPermissions} h-64 overflow-y-auto`}>
              <div className="space-y-2">
                {permissions.slice(0, Math.ceil(permissions.length / 2)).map((permission, index) => (
                  <div key={permission.name} className="flex items-center">
                    <input
                      id={permission.name}
                      name={permission.name}
                      type="checkbox"
                      checked={permission.value}
                      onChange={() => handlePermissionChange(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={permission.name} className="ml-2 text-sm text-gray-600">
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {permissions.slice(Math.ceil(permissions.length / 2)).map((permission, index) => (
                  <div key={permission.name} className="flex items-center">
                    <input
                      id={permission.name}
                      name={permission.name}
                      type="checkbox"
                      checked={permission.value}
                      onChange={() => handlePermissionChange(index + Math.ceil(permissions.length / 2))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={permission.name} className="ml-2 text-sm text-gray-600">
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
  
          <div className="flex justify-end">
          <Button
              label="Submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${styles.modalButton}`}
            >
              {isLoading ? "Updating Role..." : "Update Role"}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EditRoleModal;
