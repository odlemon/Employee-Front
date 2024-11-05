import clsx from "clsx";
import React, { useEffect, useState, useRef } from "react";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { MdOutlineEdit, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { toast } from "sonner";
import {
  AddUser,
  Button,
  ConfirmatioDialog,
  Loading,
  Title,
  UserAction,
  UserDetailsModal,
} from "../components";
import {
  useDeleteUserMutation,
  useGetTeamListsQuery,
  useUserActionMutation,
} from "../redux/slices/api/userApiSlice";
import { getInitials } from "../utils/index";
import { useSearchParams } from "react-router-dom";

const Users = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");


  const { data, isLoading, refetch } = useGetTeamListsQuery({
    search: searchTerm,
  });
  const [deleteUser] = useDeleteUserMutation();
  const [userAction] = useUserActionMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selected, setSelected] = useState(null);


  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };


  const editClick = (el) => {
    setSelected(el);
    setOpen(true);
  };

  const addUserClick = () => {
    setSelected(null);
    setOpen(true);
  };

  const userStatusClick = (el) => {
    setSelected(el);
    setOpenAction(true);
  };

  const showDetailsClick = (el) => {
    setSelected(el);
    setOpenDetailsModal(true);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteUser(selected);
      refetch();
      toast.success(res?.data?.message);
      setSelected(null);
      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || error.error);
    }
  };

  const userActionHandler = async () => {
    try {
      const res = await userAction({
        isActive: !selected?.isActive,
        id: selected?._id,
      });
      refetch();
      toast.success(res?.data?.message);
      setSelected(null);
      setTimeout(() => {
        setOpenAction(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || error.error);
    }
  };

  useEffect(() => {
    refetch();
  }, [open]);

  // Pagination logic

  const TableHeader = () => (
    <thead className='border-b border-gray-300 dark:border-gray-600'>
      <tr className='text-black dark:text-white text-left'>
        <th className='py-2'>Full Name</th>
        <th className='py-2'>Title</th>
        <th className='py-2'>Email</th>
        <th className='py-2'>Department</th>
        <th className='py-2'>Gender</th>
        <th className='py-2'>Active</th>
        <th className='py-2'>Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
      <td className='p-2'>
        <div className='flex items-center gap-3'>
          <div
            className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700 cursor-pointer'
            onClick={() => showDetailsClick(user)}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white text-xs md:text-sm text-center">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          {user.name}
        </div>
      </td>
      <td className='p-2'>{user.title}</td>
      <td className='p-2'>{user.email}</td>
      <td className='p-2'>{user.department}</td>
      <td className='p-2'>{user.gender}</td>
      <td>
        <button
          onClick={() => userStatusClick(user)}
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </button>
      </td>
      <td className='p-2 flex gap-4 justify-end'>
     
        <Button
          icon={<MdOutlineEdit className='text-lg' />}
          className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
          label=''
          type='button'
          onClick={() => editClick(user)}
        />
  
        <Button
          icon={<IoMdTrash className='text-lg' />}
          className='flex flex-row-reverse gap-1 items-center bg-red-600 text-white rounded-md py-2 2xl:py-2.5'
          label=''
          type='button'
          onClick={() => deleteClick(user?._id)}
        />

      </td>
    </tr>
  );


  return isLoading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title='Employees' />
          <div className="flex items-center gap-4">

            <Button
              label='Add New User'
              icon={<IoMdAdd className='text-lg' />}
              className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5'
              onClick={addUserClick}
            />
          </div>
        </div>
        <div className='bg-white dark:bg-[#1f1f1f] px-2 md:px-4 py-4 shadow-md rounded'>
          <div className='overflow-x-auto'>
            <table className='w-full mb-5'>
              <TableHeader />
              <tbody>
                {data?.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))}
              </tbody>  
            </table>
          </div>
          
         
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />

        <UserDetailsModal
          open={openDetailsModal}
          setOpen={setOpenDetailsModal}
          userData={selected}
        />

    </>
  );
};

export default Users;