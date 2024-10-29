import React, { useEffect, useState, useMemo } from "react";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView } from "../components/tasks";
import { useGetAllTaskQuery, useCreateTaskMutation } from "../redux/slices/api/taskApiSlice";
import { useSelector } from "react-redux";
import { usePermissions } from "../utils/PermissionsContext";
import { useGetBranchesQuery } from "../redux/slices/api/branchApiSlice";
import { useGetAllDepartmentsQuery } from "../redux/slices/api/departmentApiSlice";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Tasks = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");
  const { permissions } = usePermissions();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentName, setSelectedDepartmentName] = useState("");

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  const status = params?.status || "";

  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: searchTerm,
  });

  const { data: branches } = useGetBranchesQuery();
  const { data: departments } = useGetAllDepartmentsQuery();

  const [createTask] = useCreateTaskMutation();

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  useEffect(() => {
    refetch();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [status, searchTerm]);

  const handleTabChange = (index) => {
    setSelected(index);
  };

  const handleBranchChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedBranch(selectedValue);
    setSelectedDepartment("");
    setSelectedDepartmentName("");
  };

  const handleDepartmentChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedDepartment(selectedValue);
    const selectedDept = departments?.find(dept => dept._id === selectedValue);
    setSelectedDepartmentName(selectedDept ? selectedDept.name : "");
  };

  // Filter departments based on selected branch
  const filteredDepartments = useMemo(() => {
    return departments?.filter(
      (department) => department?.branch && department.branch._id === selectedBranch
    ) || [];
  }, [departments, selectedBranch]);
  

  const filteredTasks = useMemo(() => {
    if (!data?.tasks || !selectedDepartmentName) return [];
  
    return data.tasks.filter((task) => {
      if (!selectedDepartmentName) {
        // If no department is selected, include all tasks
        return true;
      }

      const isInSelectedDepartment = task.department === selectedDepartmentName;
      const isInUserBranch = task.branch === user.branch;
  
      console.log(`Task ${task._id}:`, {
        department: task.department,
        selectedDepartment: selectedDepartmentName,
        branch: task.branch,
        isInSelectedDepartment,
        isInUserBranch
      });
  
      // Include tasks that are in the selected department
      const shouldInclude = user.isAdmin ? isInSelectedDepartment : (isInUserBranch && isInSelectedDepartment);
      console.log(`Including task ${task._id}:`, shouldInclude);
  
      return shouldInclude;
    });
  }, [data?.tasks, selectedDepartmentName, user.isAdmin, user.branch]); 
  
  useEffect(() => {
    console.log("Filtered tasks count:", filteredTasks.length);
  }, [filteredTasks]);

  console.log("Status value:", status);

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Objectives` : "Objectives"} />

        <div className="flex items-center gap-4">
          <select
            className="border border-gray-300 rounded-md py-2 px-4"
            value={selectedBranch}
            onChange={handleBranchChange}
          >
            <option value="">Select Branch</option>
            {branches?.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-md py-2 px-4"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            disabled={!selectedBranch}
          >
            <option value="">Select Department</option>
            {filteredDepartments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>

          {permissions.includes("can view dashboard") && (
            <Button
              label="Create Objective"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
              onClick={() => setOpen(true)}
            />
          )}
        </div>
      </div>

      <div>
        <Tabs tabs={TABS} selected={selected} setSelected={handleTabChange}>
          {selected === 0 ? (
            <BoardView tasks={filteredTasks} selectedDepartment={selectedDepartmentName} status={status} />
          ) : (
            <Table tasks={filteredTasks} />
          )}
        </Tabs>
      </div>

      <AddTask open={open} setOpen={setOpen} onCreateTask={handleCreateTask} branch={selectedBranch} />
    </div>
  );
};

export default Tasks;