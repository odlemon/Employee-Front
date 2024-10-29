import React, { useState, useEffect } from "react";
import { Button, RevModalWrapper } from "../components";
import { useGetBranchesQuery } from "../redux/slices/api/branchApiSlice";
import { useSetRevenueMutation } from "../redux/slices/api/revenueApiSlice";
import { toast } from "sonner";

const RevenueTargetModal = ({ open, setOpen }) => {
  const [revenueName, setRevenueName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalTarget, setTotalTarget] = useState(0);
  const [branchTargets, setBranchTargets] = useState({});
  const [setRevenue, { isLoading: isCreating }] = useSetRevenueMutation();
  const { data: branches, isLoading: branchesLoading } = useGetBranchesQuery();

  useEffect(() => {
    if (branches) {
      const initialBranchTargets = branches.reduce((acc, branch) => {
        acc[branch._id] = "";
        return acc;
      }, {});
      setBranchTargets(initialBranchTargets);
    }
  }, [branches]);

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    const target = parseFloat(totalTarget);
    if (isNaN(target) || target <= 0) {
      toast.error("Please enter a valid total revenue target");
      return;
    }
  
    if (!revenueName || !startDate || !endDate) {
      toast.error("Please fill out all fields");
      return;
    }
  
    const totalDistributed = Object.values(branchTargets).reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      0
    );
  
    if (Math.abs(totalDistributed - target) > 0.01) {
      toast.error("The sum of branch targets must equal the total target");
      return;
    }
  
    // Prepare the branchTargets as an array of { id, target } objects
    const formattedBranchTargets = Object.entries(branchTargets).map(([id, value]) => ({
      id,
      target: parseFloat(value) || 0
    }));
  
    // Log the data being sent
    console.log({
      revenueName,
      startDate,
      endDate,
      totalTarget: target,
      targetBranches: formattedBranchTargets
    });
  
    try {
      // Create new revenue
      await setRevenue({
        revenueName,
        startDate,
        endDate,
        totalTarget: target,
        targetBranches: formattedBranchTargets // Now an array of objects with id and target
      }).unwrap();
  
      toast.success("Revenue targets set successfully");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Error setting revenue targets");
    }
  };
  
  
  

  const resetForm = () => {
    setRevenueName("");
    setStartDate("");
    setEndDate("");
    setTotalTarget(0);
    setBranchTargets({});
  };

  const handleBranchTargetChange = (branchId, value) => {
    const newValue = value === "" ? "" : parseFloat(value);

    // Calculate the current total excluding the selected branch
    const currentTotal = Object.entries(branchTargets).reduce(
      (sum, [id, val]) => sum + (id === branchId ? 0 : parseFloat(val) || 0),
      0
    );

    const remainingTarget = parseFloat(totalTarget) - currentTotal;

    setBranchTargets((prev) => ({
      ...prev,
      [branchId]: newValue > remainingTarget ? remainingTarget.toString() : value,
    }));
  };

  const remainingTarget = () => {
    if (!branchTargets) return 0; // Default to 0 if branchTargets is null or undefined
    const distributed = Object.values(branchTargets).reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      0
    );
    return Math.max(0, parseFloat(totalTarget) - distributed);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <RevModalWrapper open={open} setOpen={setOpen}>
      <div className="relative flex flex-col h-full max-h-screen">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
          <button className="text-red-500 hover:text-red-700" onClick={handleClose}>
            <svg className='w-8 h-8 sm:w-12 sm:h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 pt-8 sm:pt-0">Set Target</h2>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="w-full sm:w-1/2">
                <label htmlFor="revenueName" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Name
                </label>
                <input
                  type="text"
                  id="revenueName"
                  value={revenueName}
                  onChange={(e) => setRevenueName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                  placeholder="Enter target name"
                />
              </div>
              <div className="w-full sm:w-1/2 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="w-full sm:w-1/2">
                <label htmlFor="totalTarget" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Target
                </label>
                <input
                  type="number"
                  id="totalTarget"
                  value={totalTarget}
                  onChange={(e) => setTotalTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                  placeholder="Enter total target"
                  min="0"
                />
                <p className="mt-2 text-sm text-gray-600">Remaining to distribute: {remainingTarget().toFixed(2)}</p>
              </div>
              <div className="w-full sm:w-1/2">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Branch Distribution</h3>
                {branchesLoading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                    {Array.isArray(branches) && branches.length > 0 ? (
                      branches.map((branch) => (
                        <div key={branch._id} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                          <label htmlFor={`branch-${branch._id}`} className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:w-1/2">
                            {branch.name}
                          </label>
                          <input
                            type="number"
                            id={`branch-${branch._id}`}
                            value={branchTargets[branch._id] || ""}
                            onChange={(e) => handleBranchTargetChange(branch._id, e.target.value)}
                            className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            placeholder="Enter branch target"
                            min="0"
                          />
                        </div>
                      ))
                    ) : (
                      <p>No branches available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 sm:pt-6">
              <Button
                label="Submit"
                type="button"
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                disabled={isCreating}
              >
                Set Revenue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RevModalWrapper>
  );
};

export default RevenueTargetModal;
