import clsx from "clsx";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { FaTasks } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp, MdOutlineDoneAll, MdOutlineMessage } from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Tabs } from "../components";
import { TaskColor } from "../components/tasks";
import { useGetSingleTaskQuery, usePostTaskActivityMutation } from "../redux/slices/api/taskApiSlice";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Objective Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "TODO",
  "In Progress",
  "Completed",
];

const Activities = ({ activity, id, refetch, initialStage, kpi }) => {
  const [selected, setSelected] = useState(initialStage?.toUpperCase());
  const [text, setText] = useState("");
  const [kpiValue, setKpiValue] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  useEffect(() => {
    console.log("Selected stage:", selected);
  }, [selected]);

  const handleSubmit = async () => {
    try {
      const data = {
        type: selected?.toLowerCase(),
        activity: text,
        ...(kpi?.type === "Monetary" ? { monetaryValueAchieved: parseFloat(kpiValue) } : {}),
        ...(kpi?.type === "Percentage" ? { percentValueAchieved: parseFloat(kpiValue) } : {}),
      };
      const res = await postActivity({
        data,
        id,
      }).unwrap();
      setText("");
      setKpiValue("");
      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleCheckboxChange = (item) => {
    const upperCaseItem = item.toUpperCase();
    setSelected(upperCaseItem);
    console.log("Selected stage changed to:", upperCaseItem);
  };

  const Card = ({ item, isConnected }) => {
    return (
      <div className={`flex space-x-4`}>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            {TASKTYPEICON[item?.type]}
          </div>
          {isConnected && (
            <div className="h-full flex items-center">
              <div className="w-0.5 bg-gray-300 h-full"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-y-1 mb-8">
          <p className="font-semibold">{item?.by?.name}</p>
          <div className="text-gray-500 space-x-2">
            <span className="capitalize">{item?.type}</span>
            <span className="text-sm">{moment(item?.date).fromNow()}</span>
          </div>
          <div className="text-gray-700">{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto">
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Activities</h4>
        <div className="w-full space-y-0">
          {activity?.map((item, index) => (
            <Card
              key={item.id}
              item={item}
              isConnected={index < activity?.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">
          Add Activity
        </h4>
        <div className="w-full flex flex-wrap gap-5">
          {act_types.map((item) => (
            <div key={item} className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selected === item.toUpperCase()}
                onChange={() => handleCheckboxChange(item)}
              />
              <p>{item}</p>
            </div>
          ))}
          {kpi && (
            <div className="w-full mt-5">
              <label className="block text-gray-600 font-semibold mb-2">
                {kpi.type === "Monetary" ? "Monetary Value Achieved:" : "Percentage Value Achieved:"}
              </label>
              <input
                type="number"
                step="0.01"
                value={kpiValue}
                onChange={(e) => setKpiValue(e.target.value)}
                placeholder={`Enter ${kpi.type === "Monetary" ? "Monetary" : "Percentage"} Value`}
                className="bg-white w-full border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500"
              />
            </div>
          )}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type ......"
            className="bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500"
          ></textarea>
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type="button"
              label="Submit"
              onClick={handleSubmit}
              className="bg-blue-600 text-white rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);

  const [selected, setSelected] = useState(0);
  const task = data?.task;

  useEffect(() => {
    console.log("Task data:", task);
  }, [task]);

  const handleTabChange = (index) => {
    setSelected(index);
    console.log("Selected tab changed to:", index);
  };

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <h1 className="text-2xl text-gray-600 font-bold">{task?.title}</h1>
      <Tabs tabs={TABS} setSelected={handleTabChange}>
        {selected === 0 ? (
          <>
            <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow rounded-md px-8 py-8 overflow-y-auto">
              <div className="w-full md:w-1/2 space-y-8">
                <div className="flex items-center gap-5">
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className="text-lg">{ICONS[task?.priority]}</span>
                    <span className="uppercase">{task?.priority} Priority</span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <TaskColor className={TASK_TYPE[task?.stage]} />
                    <span className="text-black uppercase">{task?.stage}</span>
                  </div>
                </div>

                {task?.kpi?.type === "Monetary" && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Monetary Value to be achieved:</span>
                    <span className="text-green-600">
                      ${task?.monetaryValue?.toFixed(2)}
                    </span>
                  </div>
                )}

                {task?.kpi?.type === "Percentage" && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Percentage Value to be achieved:</span>
                    <span className="text-green-600">
                      {task?.percentValue?.toFixed(2)}%
                    </span>
                  </div>
                )}

                <p className="text-gray-500">
                  Created At: {new Date(task?.date).toDateString()}
                </p>

                <div className="flex items-center gap-8 p-4 border-y border-gray-200">
                  <div className="space-x-2">
                    <span className="font-semibold">Assets :</span>
                    <span>{task?.assets?.length}</span>
                  </div>
                  <div className="space-x-2">
                    <span className="font-semibold">Sub-Objective :</span>
                    <span>{task?.subTasks?.length}</span>
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  <p className="text-gray-500 font-semibold text-sm">TASK TEAM</p>
                  <div className="space-y-3">
                    {task?.team?.map((m, index) => (
                      <div
                        key={index + m?._id}
                        className="flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white">
                          {getInitials(m.name)}
                        </div>
                        <p className="text-gray-700">{m.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-8">
                <p className="text-gray-500 font-semibold text-sm">SUB-OBJECTIVES</p>
                <div className="space-y-5">
                  {task?.subTasks?.map((item, index) => (
                    <div
                      key={index + item?.id}
                      className="p-4 bg-gray-100 rounded-md space-y-3"
                    >
                      <p className="font-semibold">{item?.title}</p>
                      <div className="flex gap-3 items-center">
                        <p className="text-xs text-gray-600">
                          Created At:{" "}
                          <span>{new Date(item?.date).toDateString()}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-3">
                <p className="text-lg font-semibold">ASSETS</p>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task?.assets?.map((el, index) => {
                    return (
                      <div key={index} className="relative">
                        {el.includes(".pdf") ? (
                          <a
                            href={el}
                            target="_blank"
                            className="flex items-center justify-center w-full h-24 bg-gray-200 rounded-md"
                            rel="noopener noreferrer"
                          >
                            <MdOutlineMessage className="text-gray-500" size={24} />
                            <span className="ml-2 text-gray-700">PDF Document</span>
                          </a>
                        ) : (
                          <img
                            src={el}
                            alt={`Asset ${index}`}
                            className="w-full rounded-md object-cover h-24 md:h-44 2xl:h-52 cursor-pointer transition-all duration-700 md:hover:scale-125 hover:z-50"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <Activities
            activity={task?.activities}
            id={task?._id}
            refetch={refetch}
            initialStage={task?.stage}
            kpi={task?.kpi}
          />
        )}
      </Tabs>
    </div>
  );
};

export default TaskDetail;
