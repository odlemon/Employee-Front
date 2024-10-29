import React from "react";

const Card = () => {
  return (
    <div className='w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between'>
      <div className='h-full flex flex-1 flex-col justify-between'>
        <p className='text-base text-gray-600'>Label</p>
        <span className='text-2xl font-semibold'>Count</span>
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500">
        {/* Icon can go here */}
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className='py-6'>
      <div className='w-full bg-white p-6 shadow-md rounded-md mt-5'>
        <h4 className='text-xl text-gray-500 font-bold mb-4'>Branch Overview</h4>
        <div className='grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;