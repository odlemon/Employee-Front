import React, { useState, useEffect } from "react";
import { Button, ModalWrapper } from "../components";
import { useCreateKPIMutation } from "../redux/slices/api/kpiApiSlice";
import { toast } from "sonner";

const AddKPIModal = ({ open, setOpen, branchId, refetch }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Metric");
  const [createKPI, { isLoading }] = useCreateKPIMutation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      console.log("Submitting KPI creation with data:", { name, type, branchId });
      await createKPI({ name, type, branchId}).unwrap();
      toast.success("KPI created successfully");
      setOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const resetForm = () => {
    setName("");
    setType("Metric");
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <ModalWrapper open={open} setOpen={setOpen} title="Add New KPI">
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">KPI Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
            placeholder="Enter KPI name"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          >
            <option value="Metric">Metric</option>
            <option value="Percentage">Percentage</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button
            label="Submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            {isLoading ? "Adding..." : "Add KPI"}
          </Button>
        </div>
      </div>
      </div>
    </ModalWrapper>
  );
};

export default AddKPIModal;
