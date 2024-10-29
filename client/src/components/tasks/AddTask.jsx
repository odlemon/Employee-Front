import { Dialog } from "@headlessui/react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { app } from "../../utils/firebase";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";
import { useGetAllKPIQuery } from "../../redux/slices/api/kpiApiSlice";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const uploadedFileURLs = [];

const uploadFile = async (file) => {
  const storage = getStorage(app);

  const name = new Date().getTime() + file.name;
  const storageRef = ref(storage, name);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("Uploading");
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            uploadedFileURLs.push(downloadURL);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

const AddTask = ({ open, setOpen, task, branch }) => {
  const { data: kpis = [] } = useGetAllKPIQuery();

  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: task?.stage?.toUpperCase() || LISTS[0],
    priority: task?.priority?.toUpperCase() || PRIORITY[2],
    assets: [],
    monetaryValue: task?.monetaryValue || 0,
    percentValue: task?.percentValue || 0,
    branch: task?.branch || "",
    kpi: task?.kpi || "",
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm({ defaultValues });

  const [stage, setStage] = useState(defaultValues.stage);
  const [team, setTeam] = useState(defaultValues.team);
  const [priority, setPriority] = useState(defaultValues.priority);
  const [assets, setAssets] = useState([]);
  const [kpi, setKPI] = useState({
    id: task?.kpi?.id || '',
    name: task?.kpi?.name || '',
    type: task?.kpi?.type || '',
    branch: task?.branch || '',
  });
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const URLS = task?.assets ? [...task.assets] : [];

  const selectedKPI = kpis.find((k) => k._id === kpi.id);
  const kpiType = selectedKPI?.type;

  const handleOnSubmit = async (data) => {
    if (!kpi.id) {
      toast.error("Please select a KPI before submitting.");
      return;
    }
  
    for (const file of assets) {
      setUploading(true);
      try {
        await uploadFile(file);
      } catch (error) {
        console.error("Error uploading file:", error.message);
        return;
      } finally {
        setUploading(false);
      }
    }
  
    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
        branch: kpi.branch,
        kpi: kpi.id
          ? {
              id: kpi.id,
              name: kpi.name,
              type: kpi.type,
            }
          : null,
      };
  
      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();
  
      toast.success(res.message);
  
      setTimeout(() => {
        setOpen(false);
        window.location.reload(); // Reload the page after success
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };
  

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleKPISelect = (selected) => {
    const selectedKPI = kpis.find(k => k.name === selected);
    const branch = selectedKPI ? selectedKPI.branch : '';
    setKPI(selectedKPI ? {
      id: selectedKPI._id,
      name: selectedKPI.name,
      type: selectedKPI.type,
      branch: branch,
    } : {});
    setValue('branch', branch);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
  <form onSubmit={handleSubmit(handleOnSubmit)} className="">
    <div className="flex justify-between items-center mb-4">
      <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900">
        {task ? "UPDATE TASK" : "ADD TASK"}
      </Dialog.Title>
      
      <button
        type="button"
        className="text-red-500 hover:text-red-700"
        onClick={handleClose}
      >
        <svg
          className="w-10 h-10"
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
    </div>

    <div className="mt-2 flex flex-col gap-6">
      <Textbox
        placeholder="Objective title"
        type="text"
        name="title"
        label="Objective Title"
        className="w-full rounded"
        register={register("title", {
          required: "Title is required!",
        })}
        error={errors.title ? errors.title.message : ""}
      />

      <UserList setTeam={setTeam} team={team} branch={branch} />
      <div className="flex gap-4">
        <SelectList
          label="Objective Stage"
          lists={LISTS}
          selected={stage}
          setSelected={setStage}
        />
        <SelectList
          label="Priority Level"
          lists={PRIORITY}
          selected={priority}
          setSelected={setPriority}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-full">
          <Textbox
            placeholder="Date"
            type="date"
            name="date"
            label="Objective Deadline"
            className="w-full rounded"
            register={register("date", {
              required: "Date is required!",
            })}
            error={errors.date ? errors.date.message : ""}
          />
        </div>
        <div className="w-full flex items-center justify-center mt-4">
          <label
            className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
            htmlFor="fileUpload"
          >
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              onChange={(e) => handleSelect(e)}
              accept=".pdf, .jpg, .jpeg, .png"
              multiple={true}
            />
            <BiImages />
            <span>Add Assets</span>
          </label>
        </div>
      </div>

      <div className="relative w-full">
  <SelectList
    label="KPI"
    lists={kpis.map(k => k.name)}
    selected={kpi ? kpis.find(k => k._id === kpi.id)?.name : ''}
    setSelected={handleKPISelect}
  />
</div>


      {kpiType === "Metric" && (
        <div className="w-full">
          <Textbox
            placeholder="Monetary Value"
            type="number"
            name="monetaryValue"
            label="Monetary Value"
            className="w-full rounded"
            register={register("monetaryValue", {
              required: "Monetary value is required!",
            })}
            error={errors.monetaryValue ? errors.monetaryValue.message : ""}
          />
        </div>
      )}
      {kpiType === "Percentage" && (
        <div className="w-full">
          <Textbox
            placeholder="Percentage Value"
            type="number"
            name="percentValue"
            label="Percentage Value"
            className="w-full rounded"
            register={register("percentValue", {
              required: "Percentage value is required!",
            })}
            error={errors.percentValue ? errors.percentValue.message : ""}
          />
        </div>
      )}
    </div>

    {isLoading || isUpdating || uploading ? (
      <div className="py-4">
        <Loading />
      </div>
    ) : (
      <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
        <Button
          label="Submit"
          type="submit"
          className="bg-green-600 px-8 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
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

export default AddTask;
