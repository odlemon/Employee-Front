import React, { useState, useEffect } from "react";
import { Button, ModalWrapper } from "../components";
import { useUpdateBranchMutation } from "../redux/slices/api/branchApiSlice";
import { toast } from "sonner";

const EditBranchModal = ({ open, setOpen, name: initialName, description: initialDescription, id, refetch }) => {
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [updateBranch, { isLoading }] = useUpdateBranchMutation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Branch name is required");
      return;
    }

    try {
      console.log("Submitting branch update with data:", { id, name, description });
      await updateBranch({ id, data: { name, description } }).unwrap();
      toast.success("Branch updated successfully");
      setOpen(false);
      refetch(); // Refresh branches after the update
    } catch (error) {
      toast.error("Error updating branch");
    }
  };

  const resetForm = () => {
    setName(initialName || "");
    setDescription(initialDescription || "");
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      // Populate the form fields when the modal opens
      setName(initialName || "");
      setDescription(initialDescription || "");
    }
  }, [open, initialName, initialDescription]);

  return (
    <ModalWrapper open={open} setOpen={setOpen} title="Edit Branch">
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              required
              placeholder="Enter branch name"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              rows="3"
              placeholder="Enter branch description"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button
              label="Submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EditBranchModal;
