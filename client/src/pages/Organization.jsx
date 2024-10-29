import React, { useEffect, useState } from "react";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { toast } from "sonner";
import { Button, Loading, Title, AddBranchModal, EditBranchModal, BranchDetail } from "../components";
import { useDeleteBranchMutation, useGetBranchesQuery } from "../redux/slices/api/branchApiSlice";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "../utils/PermissionsContext";
import { MdOutlineEdit } from "react-icons/md";


const Organization = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");
  const { permissions } = usePermissions();
  const { data: branches, isLoading: isLoadingBranches, refetch: refetchBranches } = useGetBranchesQuery({ search: searchTerm });

  const [deleteBranch] = useDeleteBranchMutation();
  const [openAddBranchModal, setOpenAddBranchModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [openEditBranchModal, setOpenEditBranchModal] = useState(false);

  const deleteClick = async (id) => {
    try {
      const res = await deleteBranch(id);
      refetchBranches();
      toast.success(res?.data?.message);
    } catch (error) {
      console.log("Error during deletion:", error);
      toast.error(error?.data?.message || error.error);
    }
  };

  const handleAddBranch = () => {
    setOpenAddBranchModal(true);
  };

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setOpenEditBranchModal(true);
  };
  

  useEffect(() => {
    refetchBranches();
  }, [openAddBranchModal]);

  const TableHeader = () => (
    <thead className="border-b border-gray-300 dark:border-gray-600">
      <tr className="text-black dark:text-white text-left">
        <th className="py-2">Branch Name</th>
        <th className="py-2">Description</th>
        <th className="py-2"></th>
      </tr>
    </thead>
  );

  const TableRow = ({ branch }) => (
    <tr
      className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10 cursor-pointer"
      onClick={() => setSelectedBranchId(branch._id)}
    >
      <td className="p-2">{branch.name}</td>
      <td className="p-2">{branch.description}</td>
      <td className="p-2 flex gap-4 justify-end">
      <Button
        icon={<MdOutlineEdit className="text-lg" />}
        className="inline-flex items-center justify-center bg-green-600 text-white rounded-md p-2 hover:bg-green-500 transition-colors mr-2"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the row click event
          handleEditBranch(branch); // Handle editing
        }}
      />
      <Button
          icon={<IoMdTrash className='text-lg' />}
          className="flex flex-row-reverse gap-1 items-center bg-red-600 text-white rounded-md py-2 2xl:py-2.5"
          label=""
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteClick(branch._id);
          }}
        />
      </td>
    </tr>
  );

  return isLoadingBranches ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <>
      {selectedBranchId ? (
        <BranchDetail branchId={selectedBranchId} onClose={() => setSelectedBranchId(null)} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <Title title="Branches" />
            <div className="flex gap-4">
         
              {permissions.includes("can create branches") && (
                <Button
                  label="Add New Branch"
                  className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
                  onClick={handleAddBranch}
                >
                  <IoMdAdd className="mr-2" />
                </Button>
              )}
            </div>
          </div>

          {permissions.includes("can view branches") && (
            <div className="w-full">
              <div className="bg-white dark:bg-[#1f1f1f] px-2 md:px-4 py-4 shadow-md rounded">
                <div className="overflow-x-auto">
                  <table className="w-full mb-5">
                    <TableHeader />
                    <tbody>
                      {branches?.map((branch) => (
                        <TableRow key={branch._id} branch={branch} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <AddBranchModal open={openAddBranchModal} setOpen={setOpenAddBranchModal} />

          <EditBranchModal 
        open={openEditBranchModal} 
        setOpen={setOpenEditBranchModal} 
        name={selectedBranch?.name} 
        description={selectedBranch?.description} 
        id={selectedBranch?._id} 
        refetch={refetchBranches} 
      />
        </>
      )}
    </>
  );
};

export default Organization;
