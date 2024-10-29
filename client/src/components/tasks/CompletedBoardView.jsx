import React, { useState, useMemo, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import clsx from "clsx";
import { IoMdAdd } from "react-icons/io";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../utils/index.js";
import UserInfo from "../UserInfo.jsx";
import { AddSubTask, TaskAssets, TaskColor, TaskDialog } from "./index";
import TaskTitle from "./TaskTitle";
import { toast } from "sonner";
import { useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { usePermissions } from "../../utils/PermissionsContext";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const COLUMNS = ["todo", "in progress", "completed", "overdue"];

const CompletedBoardView = ({ tasks, selectedDepartment }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [taskList, setTaskList] = useState(tasks || []);
  const { permissions } = usePermissions();

  const [updateTask, { isLoading, isError, isSuccess }] = useUpdateTaskMutation();

  useEffect(() => {
    // console.log("BoardView - selectedDepartment changed:", selectedDepartment);
    // console.log("BoardView - tasks changed:", tasks);
    setTaskList(tasks || []);
  }, [tasks, selectedDepartment]);

  useEffect(() => {
    setTaskList(tasks || []);
  }, [tasks]);

  // Filter tasks based on user's role, branch, and selected department
  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      const isInDepartment = selectedDepartment ? task.department === selectedDepartment : true;
      return user.isAdmin || (task.branch === user.branch && isInDepartment);
    });
  }, [taskList, user.branch, user.isAdmin, selectedDepartment]);

  // Group tasks by column after filtering
  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column] = filteredTasks.filter(
        (task) => task.stage.toLowerCase() === column
      );
      return acc;
    }, {});
  }, [filteredTasks]);

  const totalTasks = filteredTasks.length;

  // Calculate the percentage of tasks in each column
  const getPercentage = (column) => {
    const columnTasks = groupedTasks[column].length;
    return totalTasks > 0 ? ((columnTasks / totalTasks) * 100).toFixed(2) : 0;
  };

  const getTaskId = (task) => {
    return task.id || task._id || task.taskId || JSON.stringify(task);
  };

  const onDragEnd = async (result) => {
    // Check if user has permission to change task stage
    if (!permissions.includes("can change task stage")) {
      toast.error("You do not have permission to change objective stages.");
      return;
    }

    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId === "overdue") {
      toast.error("You cannot move objectives to the Overdue column.");
      return;
    }

    if (source.droppableId === "overdue") {
      toast.error("You cannot move objectives out of the Overdue column.");
      return;
    }

    const updatedTask = taskList.find((task) => getTaskId(task) === draggableId);
    if (!updatedTask) return;

    const newTaskList = taskList.map((task) => {
      if (getTaskId(task) === draggableId) {
        return {
          ...task,
          stage: destination.droppableId,
        };
      }
      return task;
    });

    setTaskList(newTaskList);

    try {
      await updateTask({
        ...updatedTask,
        stage: destination.droppableId,
      }).unwrap();
    } catch (error) {
      toast.error("Failed to update objective.");
    }
  };
  
  const renderTask = (task, index) => {
    const taskId = getTaskId(task);

    return (
      <Draggable key={taskId} draggableId={taskId} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="w-full h-fit bg-white dark:bg-[#1f1f1f] shadow-md p-4 rounded mb-4"
          >
            <div className="w-full flex justify-between">
              <div
                className={clsx(
                  "flex flex-1 gap-1 items-center text-sm font-medium",
                  PRIOTITYSTYELS[task?.priority]
                )}
              >
                <span className="text-lg">{ICONS[task?.priority]}</span>
                <span className="uppercase">{task?.priority} Priority</span>
              </div>
              <TaskDialog task={task} />
            </div>
            <div className="flex items-center gap-2">
              <TaskColor className={TASK_TYPE[task.stage]} />
              <h4 className="text-black dark:text-white line-clamp-1">
                {task?.title}
              </h4>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(new Date(task?.date))}
            </span>
            <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2" />
            <div className="flex items-center justify-between mb-2">
              <TaskAssets
                activities={task?.activities?.length}
                subTasks={task?.subTasks?.length}
                assets={task?.assets?.length}
              />
              <div className="flex flex-row-reverse">
                {task?.team?.length > 0 &&
                  task?.team?.map((m, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                        BGS[index % BGS?.length]
                      )}
                    >
                      <UserInfo user={m} />
                    </div>
                  ))}
              </div>
            </div>
            {task?.subTasks?.length > 0 ? (
              <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-base line-clamp-1 text-black dark:text-gray-400">
                  {task?.subTasks[0].title}
                </h5>
                <div className="p-4 space-x-8">
                  <span className="text-sm text-gray-600 dark:text-gray-500">
                    {formatDate(new Date(task?.subTasks[0]?.date))}
                  </span>
                  <span className="bg-green-600/10 px-3 py-1 rounded-full text-green-700 font-medium">
                    {task?.subTasks[0]?.tag}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">No Sub-Objective</span>
              </div>
            )}
            <div className="w-full pb-2">
              <button
                disabled={!user.isAdmin}
                onClick={() => setOpen(true)}
                className="w-full flex gap-4 items-center text-sm text-gray-500 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
              >
                <IoMdAdd className="text-lg" />
                <span>ADD SUB-OBJECTIVE</span>
              </button>
            </div>
            <AddSubTask open={open} setOpen={setOpen} id={taskId} />
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full h-full overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((column) => (
            <Droppable key={column} droppableId={column}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 flex-shrink-0"
                >
                  <TaskTitle
                    label={`${column.charAt(0).toUpperCase() + column.slice(1)} (${getPercentage(column)}%)`}
                    className={TASK_TYPE[column]}
                  />
                  <div className="mt-4">
                    {groupedTasks[column].length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No Objectives
                      </div>
                    ) : (
                      groupedTasks[column].map((task, index) =>
                        renderTask(task, index)
                      )
                    )}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default CompletedBoardView;
