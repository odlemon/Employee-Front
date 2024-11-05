import { Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { useGetAllDepartmentsQuery } from "../redux/slices/api/departmentApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { Button, Loading, ModalWrapper, Textbox } from "./";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { usePermissions } from "../utils/PermissionsContext";
import { useGetBranchesQuery } from "../redux/slices/api/branchApiSlice";

const AddUser = ({ open, setOpen, userData, roles, isLoadingRoles, branch }) => {
  let defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);
  const { permissions } = usePermissions();
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(userData?.branch || null);
  const { data: branches } = useGetBranchesQuery();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      ...defaultValues,
      department: userData?.department || "",
      gender: userData?.gender || "",
    },
  });
  
  const dispatch = useDispatch();

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const uploadFile = async (file) => {
    const storage = getStorage();
    const name = new Date().getTime() + "_" + file.name;
    const storageRef = ref(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log("Uploading...");
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("Profile picture uploaded, URL:", downloadURL);
              resolve(downloadURL);
            })
            .catch((error) => {
              console.error("Failed to get download URL:", error);
              reject(error);
            });
        }
      );
    });
  };

  const watchedRole = watch("role");

  useEffect(() => {
    if (watchedRole && roles && roles.length > 0) {
      const role = roles.find(r => r._id === watchedRole);
      setSelectedRole(role || null);
    }
  }, [watchedRole, roles]);

  const downloadCredentials = (email, password) => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    const blob = new Blob([credentials], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "User_Credentials.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleOnSubmit = async (data) => {
    try {
      let profilePictureURL = null;

      if (profilePicture) {
        profilePictureURL = await uploadFile(profilePicture);
      }

      const updatedData = {
        ...data,
        profilePictureURL: profilePictureURL || data.profilePictureURL,
        _id: userData?._id,
      };
      console.log("Data being sent:", updatedData);

      if (userData) {
        const res = await updateUser(updatedData).unwrap();
        toast.success(res?.message);

        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...res?.user }));
        }
      } else {
        const res = await addNewUser({
          ...updatedData,
          password: data?.email,
        }).unwrap();

        downloadCredentials(res.email, res.password);
        
        toast.success("New User added successfully");
      }

      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <div className="flex justify-end items-center mb-4">
            <div className="flex-grow">
              <Dialog.Title
                as="h2"
                className="text-base font-bold leading-6 text-gray-900"
              >
                {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
              </Dialog.Title>
            </div>
            <button type="button" className="text-red-500 hover:text-red-700" onClick={handleClose}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Full name"
              type="text"
              name="name"
              label="Full Name"
              className="w-full rounded"
              register={register("name", {
                required: "Full name is required!",
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Full name must not contain numbers!",
                },
              })}
              error={errors.name ? errors.name.message : ""}
            />
            <Textbox
              placeholder="Title"
              type="text"
              name="title"
              label="Title"
              className="w-full rounded"
              register={register("title", {
                required: "Title is required!",
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Title must not contain numbers!",
                },
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              placeholder="Email Address"
              type="email"
              name="email"
              label="Email Address"
              className="w-full rounded"
              register={register("email", {
                required: "Email Address is required!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            {/* Department Dropdown */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                className="w-full rounded border-gray-300"
                {...register("department", { required: "Department is required!" })}
              >
                <option value="">Select Department</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
              </select>
              {errors.department && <span className="text-red-500 text-sm">{errors.department.message}</span>}
            </div>

            {/* Gender Dropdown */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                className="w-full rounded border-gray-300"
                {...register("gender", { required: "Gender is required!" })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="text-red-500 text-sm">{errors.gender.message}</span>}
            </div>
          </div>

          {isLoading || isUpdating ? (
            <div className="py-5">
              <Loading />
            </div>
          ) : (
            <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                className="bg-green-600 px-8 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
                label="Submit"
              />
              <Button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
