import React, { useState, useEffect } from "react";
import { Button, ModalWrapper } from "../components";
import { useGetSingleBranchQuery } from "../redux/slices/api/branchApiSlice";
import { useCreateBranchRevMutation, useGetBranchRevsQuery, useUpdateBranchRevMutation } from "../redux/slices/api/branchRevenueApiSlice";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const BranchProgressModal = ({ open, setOpen }) => {
  const [inputRevenue, setInputRevenue] = useState("");
  const [displayedRevenue, setDisplayedRevenue] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const branchId = user.branch;

  const { data: branch, isLoading: branchLoading } = useGetSingleBranchQuery(branchId);
  const [updateBranchRevenue, { isLoading: isUpdating }] = useUpdateBranchRevMutation();
  const { data: revTargets, isLoading: revTargetsLoading, error: revTargetsError } = useGetBranchRevsQuery();

  const [selectedRevTarget, setSelectedRevTarget] = useState(null);

  useEffect(() => {
    if (revTargets && revTargets.data && selectedRevTarget) {
      const branchTarget = selectedRevTarget.targetBranches.find(tb => tb.id === branchId);
      if (branchTarget) {
        setDisplayedRevenue(branchTarget.achieved || 0);
      }
    }
  }, [revTargets, selectedRevTarget, branchId]);

  const handleInputChange = (value) => {
    const newRevenue = parseFloat(value) || 0;
    setInputRevenue(newRevenue);
    const branchTarget = selectedRevTarget.targetBranches.find(tb => tb.id === branchId);
    setDisplayedRevenue((branchTarget?.achieved || 0) + newRevenue);
  };

  const handleSelectTarget = (event) => {
    const targetId = event.target.value;
    const target = revTargets.data.find(rev => rev._id === targetId);
    setSelectedRevTarget(target);
    const branchTarget = target.targetBranches.find(tb => tb.id === branchId);
    setDisplayedRevenue(branchTarget?.achieved || 0);
    setInputRevenue("");
  };

  const handleSubmit = async () => {
    if (!selectedRevTarget) {
      toast.error("Please select a target first");
      return;
    }
  
    try {
     
      await updateBranchRevenue({ 
        revenueId: selectedRevTarget._id, 
        data: {
          revenueId: selectedRevTarget._id, 
          branchId: branchId, 
          achieved: inputRevenue,
        }
      }).unwrap();
  
      toast.success("Branch Progress updated successfully");
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating revenue achieved:", error);
      toast.error("Error updating branch progress");
    }
  };


  const resetForm = () => {
    setInputRevenue("");
    if (selectedRevTarget) {
      const branchTarget = selectedRevTarget.targetBranches.find(tb => tb.id === branchId);
      setDisplayedRevenue(branchTarget?.achieved || 0);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const progressPercentage = () => {
    if (!selectedRevTarget) return 0;
    const branchTarget = selectedRevTarget.targetBranches.find(tb => tb.id === branchId);
    if (!branchTarget || branchTarget.target <= 0) return 0;
    return Math.min(100, (displayedRevenue / branchTarget.target) * 100);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen} title="Set Revenue Achieved" style={{ width: '1000px' }}>
      <div className="relative p-6 space-y-6" style={{ width: '100%' }}>
        <div className="absolute top-0 right-4">
          <button className="text-red-500 hover:text-red-700" onClick={handleClose}>
            <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#4A4A4A', marginTop: '-1rem', marginBottom: '1.5rem' }}>
          Update Your Branch's Progress
        </h2>
        <div className="mb-4">
          <label htmlFor="targetRevenue" className="block text-sm font-medium text-gray-700 mb-1">Select Target Revenue:</label>
          <select
            id="targetRevenue"
            onChange={handleSelectTarget}
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          >
            <option value="">Select a target</option>
            {revTargetsLoading ? (
              <option disabled>Loading targets...</option>
            ) : revTargetsError ? (
              <option disabled>Error loading targets</option>
            ) : revTargets && revTargets.data && revTargets.data.length > 0 ? (
              revTargets.data.map((rev) => (
                <option key={rev._id} value={rev._id}>
                  {rev.revenueName} - ${rev.totalTarget.toFixed(2)}
                </option>
              ))
            ) : (
              <option disabled>No targets available</option>
            )}
          </select>
        </div>

        <div className="w-full">
          {branchLoading || revTargetsLoading ? (
            <p>Loading...</p>
          ) : (
            branch && selectedRevTarget && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">{branch.name} Branch</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      {selectedRevTarget.targetBranches.find(tb => tb.id === branchId) && (
                        <>
                          <p className="text-sm text-gray-600">Revenue Target: ${selectedRevTarget.targetBranches.find(tb => tb.id === branchId).target.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Revenue Achieved: ${displayedRevenue.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Progress:</p>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="text-xs font-medium text-green-600">{progressPercentage().toFixed(2)}%</div>
                        </div>
                        <div className="relative flex mb-2 items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progressPercentage()}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor={`revenue-${branch._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Add Revenue Achieved
                  </label>
                  <input
                    type="number"
                    id={`revenue-${branch._id}`}
                    value={inputRevenue || ""}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="Revenue Achieved"
                    min="0"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    label="Submit"
                    onClick={handleSubmit}
                    disabled={isUpdating || !selectedRevTarget}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                  >
                    {isUpdating ? "Processing..." : "Submit"}
                  </Button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default BranchProgressModal;