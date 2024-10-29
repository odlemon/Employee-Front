import React, { useEffect, useState } from "react";
import { Button, ModalWrapper } from ".";
import { useUpdateDepartmentMutation } from "../redux/slices/api/departmentApiSlice"; // Make sure this is the correct import
import { toast } from "sonner";

const EditDepartmentModal = ({ open, setOpen, name: initialName, description: initialDescription, id, refetch }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [updateDepartment, { isLoading }] = useUpdateDepartmentMutation(); // Use your update mutation

  useEffect(() => {
    // Populate the fields with the props when the modal opens
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [open, initialName, initialDescription]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }

    try {
      // Call the mutation with the correct structure
      await updateDepartment({ id, data: { name, description } }).unwrap();
      toast.success("Department updated successfully");
      setOpen(false);
      resetForm();
      refetch(); 
    } catch (error) {
      toast.error("Error updating department");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen} title="Edit Department">
      <div className="relative">
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
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
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              required
              placeholder="Enter department name"
            />
          </div>
          <div>
            <label htmlFor="dept-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="dept-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              rows="3"
              placeholder="Enter department description"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button 
              label='Submit'
              onClick={handleSubmit} 
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              {isLoading ? "Updating..." : "Update Department"}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EditDepartmentModal;
