import React, { useState, useEffect } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'jspdf-autotable';
import { usePermissions } from "../utils/PermissionsContext";
import { RevenueTargetModal } from "../components";
import { useGetBranchesQuery } from "../redux/slices/api/branchApiSlice";
import { useGetBranchRevsQuery } from "../redux/slices/api/branchRevenueApiSlice";
import styles from './styles/Overview.module.css';


ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

const Overview = () => {
    const { user } = useSelector((state) => state.auth);
    const { permissions } = usePermissions();
    const { data: branchData, isLoading: branchLoading, error: branchError } = useGetBranchesQuery();
    const { data: branchRevenueData, isLoading: branchRevenueLoading, error: branchRevenueError } = useGetBranchRevsQuery();
    
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-12-31');

    const [startComparisonDate1, setStartComparisonDate1] = useState(moment().startOf('year').subtract(1, 'year').format('YYYY-MM-DD'));
    const [startComparisonDate2, setStartComparisonDate2] = useState(moment().startOf('year').subtract(1, 'year').format('YYYY-MM-DD'));
    const [toDays, setToDays] = useState(3000);
    const [openAddRevenueModal, setOpenAddRevenueModal] = useState(false);
    const { data: targetRevenue, isLoading: revenueLoading } = useGetBranchRevsQuery();
    const [revenueName, setRevenueName] = useState("");
    const [firstTargetName, setFirstTargetName] = useState("");
    const [secondTargetName, setSecondTargetName] = useState("");
    const [totalTarget, setTotalTarget] = useState(0);
    const [totalComparisonTarget, setComparisonTotalTarget] = useState(0);
    const [selectedTarget, setSelectedTarget] = useState("");
    const [firstTarget, setFirstTarget] = useState("");
    const [secondTarget, setSecondTarget] = useState("");
    const [branchPerformanceData, setBranchPerformanceData] = useState([]);

    const handleAddRevenue = () => {
        setOpenAddRevenueModal(true);
    };

    useEffect(() => {
        try {
            const performance = branchPerformance(selectedTarget); 
            setBranchPerformanceData(performance); // Set the data in state
        } catch (error) {
            //setBranchError(error); // Handle any errors
        } finally {
            //setBranchLoading(false);
        }
    }, [selectedTarget]);
    
    
    const handleTargetChange = (e) => {
        const selectedTargetId = e.target.value; // Get the selected target ID
        console.log("Target selected:", selectedTargetId); // Log the selected target value
        
        setSelectedTarget(selectedTargetId);
        
        // Find the selected target based on the ID
        const selected = targetRevenue?.data.find(target => target._id === selectedTargetId);
        
        if (selected) {
            console.log("Selected target found:", selected); // Log the selected target object
            setTotalTarget(selected.totalTarget);
            setRevenueName(selected.revenueName);
        } else {
            console.log("No target found for ID:", selectedTargetId); // Log if no target is found
        }
    };

    const handleFirstTargetChange = (e) => {
        const selectedTargetId = e.target.value; // Get the selected target ID
        console.log("Target selected:", selectedTargetId); // Log the selected target value
        
        setFirstTarget(selectedTargetId);

        
        // Find the selected target based on the ID
        const selected = targetRevenue?.data.find(target => target._id === selectedTargetId);
        
        if (selected) {
            console.log("Selected target found:", selected); // Log the selected target object
            setComparisonTotalTarget(selected.totalTarget);
        } else {
            console.log("No target found for ID:", selectedTargetId); // Log if no target is found
        }
    };

    const handleSecondTargetChange = (e) => {
        const selectedTargetId = e.target.value; 
        const selectedTargetName = e.target.name; 
        
        setSecondTarget(selectedTargetId);
        setSecondTargetName(selectedTargetName);
        
        const selected = targetRevenue?.data.find(target => target._id === selectedTargetId);
        
        if (selected) {
            console.log("Selected target found:", selected); // Log the selected target object

        } else {
            console.log("No target found for ID:", selectedTargetId); // Log if no target is found
        }
    };
    
    
    useEffect(() => {
        if (selectedTarget) {
            console.log("Selected target updated:", selectedTarget);
            branchPerformance(selectedTarget); // Call the function here
        }
    }, [selectedTarget]);
    

    const revenueTargets = targetRevenue?.data || [];

    useEffect(() => {
        // Check if revenueTargets is available and selectedTarget is not set
        if (revenueTargets && revenueTargets.length > 0 && !selectedTarget) {
            const firstTarget = revenueTargets[0];
            setSelectedTarget(firstTarget._id);
            setTotalTarget(firstTarget.totalTarget);
            setRevenueName(firstTarget.revenueName);
        }
    }, [revenueTargets, selectedTarget]);


    const getRevenueData = () => {
        //console.log("Selected Target:", selectedTarget);
        //console.log("Target Revenue Data:", targetRevenue);
    
        if (!selectedTarget || !targetRevenue) {
            //console.log("No selected target or targetRevenue is not available.");
            return [];
        }
        
        const selected = targetRevenue.data.find(target => target._id === selectedTarget);
        //console.log("Selected Target Data:", selected);
    
        if (!selected) {
            //console.log("No matching target found for the selected target.");
            return [];
        }
    
        let allData = [];
        selected.targetBranches.forEach(branch => {
            //console.log("Branch Achieved History:", branch.achievedHistory);
            
            branch.achievedHistory.forEach(history => {
                allData.push({
                    date: moment(history.date).format('YYYY-MM-DD'),
                    revenue: history.value
                });
            });
        });
    
        //console.log("All Collected Revenue Data (Unsorted):", allData);
    
        const sortedData = allData.sort((a, b) => moment(a.date).diff(moment(b.date)));
        //console.log("Sorted Revenue Data:", sortedData);
    
        return sortedData;
    };
    

    const getFirstRevenueData = () => {
        //console.log("Selected Target:", selectedTarget);
        //console.log("Target Revenue Data:", targetRevenue);
    
        if (!firstTarget || !targetRevenue) {
            //console.log("No selected target or targetRevenue is not available.");
            return [];
        }
        
        const selected = targetRevenue.data.find(target => target._id === firstTarget);
        //console.log("Selected Target Data:", selected);
    
        if (!selected) {
            //console.log("No matching target found for the selected target.");
            return [];
        }
    
        let allData = [];
        selected.targetBranches.forEach(branch => {
            
            branch.achievedHistory.forEach(history => {
                allData.push({
                    date: moment(history.date).format('YYYY-MM-DD'),
                    revenue: history.value
                });
               
            });
        });
    
    
        const sortedData = allData.sort((a, b) => moment(a.date).diff(moment(b.date)));
    
        return sortedData;
    };

    const getSecondRevenueData = () => {
        //console.log("Selected Target:", selectedTarget);
        //console.log("Target Revenue Data:", targetRevenue);
    
        if (!secondTarget || !targetRevenue) {
            //console.log("No selected target or targetRevenue is not available.");
            return [];
        }
        
        const selected = targetRevenue.data.find(target => target._id === secondTarget);
        //console.log("Selected Target Data:", selected);
    
        if (!selected) {
            console.log("No matching target found for the selected target.");
            return [];
        }
    
        let allData = [];
        selected.targetBranches.forEach(branch => {
            //console.log("Branch Achieved History:", branch.achievedHistory);
            
            branch.achievedHistory.forEach(history => {
                allData.push({
                    date: moment(history.date).format('YYYY-MM-DD'),
                    revenue: history.value
                });

            });
        });
    
        //console.log("All Collected Revenue Data (Unsorted):", allData);
    
        const sortedData = allData.sort((a, b) => moment(a.date).diff(moment(b.date)));
        //console.log("Sorted Revenue Data:", sortedData);
    
        return sortedData;
    };

    useEffect(() => {
    }, [openAddRevenueModal]);
    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().split('T')[0];
    };




    const allRevenueData = Array.isArray(branchRevenueData) ? branchRevenueData.map(item => ({
        date: moment(item.date).format('YYYY-MM-DD'),
        revenue: item.revenueAchieved
    })) : [];
    

    const filteredRevenueData = getRevenueData().filter(item => {
        const date = moment(item.date);
        const isBetween = date.isBetween(startDate, endDate, null, '[]');
        
        return isBetween;
    });
    

    

    const revenueData = {   
        labels: filteredRevenueData.map(item => moment(item.date).format('MMMM DD, YYYY')),
        datasets: [
            {
                label: 'Revenue',
                data: filteredRevenueData.map(item => item.revenue),
                borderColor: 'rgba(83, 219, 122, 0.8)',
                backgroundColor: 'rgba(83, 219, 122, 0.4)',
                fill: true,
                tension: 0.3
            }
        ]
    };


    const revenueOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw}`;
                    }
                }
            },
            annotation: {
                annotations: {
                    targetLine: {
                        type: 'line',
                        yMin: totalTarget,
                        yMax: totalTarget,
                        borderColor: 'blue',
                        borderWidth: 2,
                        label: {
                            content: `Target: $${totalTarget}`,
                            enabled: true,
                            position: 'end',
                            backgroundColor: 'blue',
                            color: 'white',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: function(value, index, values) {
                        const label = this.getLabelForValue(value);
                        const isMobile = window.innerWidth <= 768; // Example mobile breakpoint
                        
                        if (isMobile) {
                            // Show "Jan" and "Dec" only on mobile
                            if (label === "Jan" || label === "Dec") {
                                return label;
                            }
                            return ''; // Hide other labels
                        }
    
                        // Show all labels on larger screens
                        return label;
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return `$${value}`;
                    }
                }
            }
        }
    };
    
    
    
    const endComparisonDate = moment(startComparisonDate1).add(toDays, 'days').format('YYYY-MM-DD');

    const filteredComparisonData1 = getFirstRevenueData().filter(item => {
        const date = moment(item.date);

        const isBetween = date.isBetween(startComparisonDate1, endComparisonDate , null, '[]');
        
        return isBetween;
    });

    const filteredComparisonData2 = getSecondRevenueData().filter(item => {
        const date = moment(item.date);

        const isBetween = date.isBetween(startComparisonDate1, endComparisonDate , null, '[]');
        
        return isBetween;
    });


    const comparisonData = {
        labels: filteredComparisonData1.map(item => moment(item.date).format('MMMM')),
        datasets: [
            {
                label: `First Target`,
                data: filteredComparisonData1.map(item => item.revenue),
                borderColor: 'rgba(83, 219, 122, 0.8)', 
                backgroundColor: 'rgba(83, 219, 122, 0.4)',
                fill: true,
                tension: 0.3,
                borderWidth: 1
            },
            {
                label: 'Second Target',
                data: filteredComparisonData2.map(item => item.revenue),
                borderColor: 'rgba(255, 99, 132, 0.8)',  // Color for the second line
                backgroundColor: 'rgba(255, 99, 132, 0.4)',
                fill: true,
                tension: 0.3,
                borderWidth: 4
            }
        ]
    };

    const comparisonOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw}`;
                    }
                }
            },
            annotation: {
                annotations: {
                    targetLine: {
                        type: 'line',
                        yMin: totalComparisonTarget,
                        yMax: totalComparisonTarget,
                        borderColor: 'blue',
                        borderWidth: 2,
                        label: {
                            content: `Target: $${totalComparisonTarget}`,
                            enabled: true,
                            position: 'end',
                            backgroundColor: 'blue',
                            color: 'white',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: function(value, index, values) {
                        const label = this.getLabelForValue(value);
                        const isMobile = window.innerWidth <= 768; // Example mobile breakpoint
    
                        if (isMobile) {
                            // Show only "Jan" and "Dec" on mobile
                            if (label === "Jan" || label === "Dec") {
                                return label;
                            }
                            return ''; // Hide other labels
                        }
    
                        // Show all labels on larger screens
                        return label;
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return `$${value}`;
                    }
                }
            }
        }
    };
        
    const branchPerformance = (selectedTarget) => {
    
        if (!Array.isArray(branchData)) {
            console.error("branchData is undefined or not an array:", branchData);
            return [];
        }
    
        const revenueData = targetRevenue?.data || [];
        console.log("Revenue Data:", revenueData);
    
        const branchAchievedMap = {};
        const branchTargetMap = {};
    
        if (!revenueData || revenueData.length === 0) {
            console.log("No revenue data available."); 
            return [];
        }
  
        revenueData.forEach(item => {
            const branchTargets = item.targetBranches;
            if (!branchTargets || branchTargets.length === 0) {
                console.log("No target branches found for revenue item:", item); 
                return; 
            }
    
            branchTargets.forEach(target => {
            
                const matchingBranch = branchData.find(branch => branch._id === target.id);
    
                if (!matchingBranch) {
                    console.log(`No matching branch found for target ID: ${target.id}`);
                    return;
                }
    
                const branchName = matchingBranch.name; 
                if (!branchAchievedMap[branchName]) {
                    branchAchievedMap[branchName] = 0;
                }
                branchAchievedMap[branchName] += target.achieved; 
    
                if (!branchTargetMap[branchName]) {
                    branchTargetMap[branchName] = 0;
                }
                branchTargetMap[branchName] += target.target; 
            });
        });
    
        const performanceData = Object.keys(branchAchievedMap).map(branchName => {
            const achieved = branchAchievedMap[branchName];
            const target = branchTargetMap[branchName] || 1; 
    
            const performance = (achieved / target) * 100;
    
            console.log(`Branch: ${branchName}, Achieved: ${achieved}, Target: ${target}, Performance: ${performance}`); 
    
            return {
                name: branchName,
                revenueAchieved: achieved,
                revenueTarget: target,
                performance: performance.toFixed(2) + '%',
            };
        });
    
        console.log("Final Performance Data:", performanceData);
        return performanceData || []; 
    };
    
    
    
    return (
        <div className='py-4 px-2 sm:px-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4'>
            <p className='text-2xl sm:text-3xl font-semibold text-gray-600 mb-2 sm:mb-0'>
              Good {moment().hour() < 12 ? "morning" : moment().hour() < 18 ? "afternoon" : "evening"},
              {" "}
              <span className='text-gray-900'>{user?.name}</span>
            </p>
    
            <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto'>
              {permissions.includes("can set organisation objective") && (
                <button
                  onClick={handleAddRevenue}
                  className='flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto'
                >
                  Set Target
                </button>
              )}
    
              <select
                value={selectedTarget}
                onChange={handleTargetChange}
                className='block w-full sm:w-40 h-10 border border-gray-300 rounded-md shadow-sm'
              >
                <option value="">Choose Target</option>
                {revenueTargets.map(target => (
                  <option key={target._id} value={target._id}>
                    {target.revenueName} 
                  </option>
                ))}
              </select>
            </div>
          </div>
        
          <div className='w-full bg-white p-4 sm:p-6 shadow-md rounded-md mt-5'>
            <div className='space-y-6'>
              <div className='w-full bg-gray-100 p-4 rounded-lg shadow'>
                <h3 className='text-xl font-semibold mb-4'>Revenue per Month - {revenueName}</h3>
                <div className='bg-white p-4 rounded-lg shadow-md'>
                  <div className='mb-6'>
                    <div className='bg-white p-2 sm:p-4 rounded-lg shadow-md'>
                      <Line data={revenueData} options={revenueOptions} />
                    </div>
                  </div>
                  <div className='flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0'>
                    <div className='w-full sm:w-auto'>
                      <label className='block text-sm font-medium text-gray-700'>Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className='mt-1 block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                      />
                    </div>
                    <div className='w-full sm:w-auto'>
                      <label className='block text-sm font-medium text-gray-700'>End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className='mt-1 block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                      />
                    </div>
                  </div>
                </div>
              </div>
    
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='bg-gray-100 p-4 rounded-lg shadow'>
                  <h3 className='text-xl font-semibold mb-4'>Target Comparison</h3>
                  <div className='bg-white p-4 rounded-lg shadow-md'>
                    <div className='flex flex-col sm:flex-row justify-between mb-4 space-y-2 sm:space-y-0'>
                      <div className='w-full sm:w-auto'>
                        <label className='block text-sm font-medium text-gray-700'>First Target</label>
                        <select
                          value={firstTarget}
                          onChange={handleFirstTargetChange}
                          className='mt-1 block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                        >
                          <option value="">Choose Target</option>
                          {revenueTargets.map(target => (
                            <option key={target._id} value={target._id}>
                              {target.revenueName}
                            </option>
                          ))}
                        </select>
                      </div>
    
                      <div className='w-full sm:w-auto'>
                        <label className='block text-sm font-medium text-gray-700'>Second Target</label>
                        <select
                          value={secondTarget}
                          onChange={handleSecondTargetChange}
                          className='mt-1 block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                        >
                          <option value="">Choose Target</option>
                          {revenueTargets.map(target => (
                            <option key={target._id} value={target._id} name={target.revenueName}>
                              {target.revenueName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
    
                    <div className='bg-white p-2 sm:p-4 rounded-lg shadow-md'>
                      <Line data={comparisonData} options={comparisonOptions} />
                    </div>
    
                    <div className='flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0'>
                      <div className='w-full sm:w-auto'>
                        <label className='block text-sm font-medium text-gray-700'>Start Date</label>
                        <input
                          type="date"
                          value={startComparisonDate1}
                          onChange={(e) => setStartComparisonDate1(e.target.value)}
                          className='mt-1 block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                        />
                      </div>
    
                      <div className='w-full sm:w-auto'>
                        <label className='block text-sm font-medium text-gray-700'>To Days</label>
                        <input
                          type="number"
                          value={toDays}
                          onChange={(e) => setToDays(e.target.value)}
                          className='mt-1 block w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                        />
                      </div>
                    </div>
                  </div>
                </div>
    
                <div className='bg-gray-100 p-4 rounded-lg shadow'>
                  <h3 className="text-xl font-semibold mb-4">Branch Performance</h3>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="space-y-4">
                      {branchLoading ? (
                        <p>Loading branch data...</p>
                      ) : branchError ? (
                        <p className="text-red-500">Error loading branch data: {branchError.message}</p>
                      ) : Array.isArray(branchPerformanceData) && branchPerformanceData.length > 0 ? (
                        branchPerformanceData.map((branch, index) => {
                          const percentageAchieved = (branch.revenueAchieved / branch.revenueTarget) * 100;
    
                          return (
                            <div key={branch.name || index} className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                                <p className="text-lg font-medium">{branch.name}</p>
                                <p className="text-sm text-gray-600">
                                  ${branch.revenueAchieved.toLocaleString()} / ${branch.revenueTarget.toLocaleString()}
                                </p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-green-500 h-2.5 rounded-full"
                                  style={{ width: `${percentageAchieved}%` }}
                                ></div>
                              </div>
                              <p className="text-right text-sm text-gray-600 mt-1">
                                {percentageAchieved.toFixed(2)}%
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-600">No branch performance data available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <RevenueTargetModal 
            open={openAddRevenueModal} 
            setOpen={setOpenAddRevenueModal}
          />
        </div>
      );
};

export default Overview;
