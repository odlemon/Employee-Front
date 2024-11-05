import React, { useEffect } from 'react';
import { useGetPerformanceRatingQuery } from "../redux/slices/api/taskApiSlice";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'react-datepicker/dist/react-datepicker.css';
import Spinner from './Spinner';
import styles from '../pages/styles/Performance.module.css';

const UserDetailsModal = ({ open, setOpen, userData }) => {
  const handleClose = () => {
    setOpen(false);
  };

  const { data: performanceData, isLoading, isError, refetch } = useGetPerformanceRatingQuery(
    { userId: userData?._id },
    { skip: !open || !userData?._id }
  );

  useEffect(() => {
    if (open && userData?._id) {
      refetch();
    }
  }, [open, userData?._id, refetch]);
  const exportToPDF = async () => {
    const input = document.getElementById('pdf-content');

    // Hide the download button temporarily
    const downloadButton = document.querySelector(`.${styles.button}`);
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Add Header
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 128); // Dark blue title
      const title = `Employee Performance Report: ${userData?.name}`;
      pdf.text(title, pdfWidth / 2, 20, { align: 'center' });
      pdf.setLineWidth(0.5);
      pdf.line(10, 25, pdfWidth - 10, 25);

      // Add the image to the PDF
      const imageX = 10; // X position of the image
      const imageY = 30; // Y position of the image (below the header)
      pdf.addImage(imgData, 'PNG', imageX, imageY, imgWidth, imgHeight);

      // Footer with Current Date
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      const date = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${date}`, 10, pdfHeight - 10);

      // Save the PDF
      pdf.save('performance-rating.pdf');

      // Show the download button again
      if (downloadButton) {
        downloadButton.style.display = 'block';
      }
    });
  };



  return (
    <div
      className={`${styles.overlay} fixed top-0 left-0 w-full h-full flex items-center justify-center ${open ? '' : 'hidden'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className={`${styles.modal} bg-white dark:bg-gray-800 rounded-lg p-4 w-full md:w-1/2 mx-4`}>
        <div className='flex justify-between items-center'>
          <h2 className={`${styles.title} text-xl font-semibold`}>
            Individual Performance Rating for <span>{userData?.name}</span>
          </h2>
          <button className={`${styles.close} text-red-500 hover:text-red-700`} onClick={handleClose}>
            <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div id='pdf-content' className={`flex flex-col gap-2 mt-4`}>
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <Spinner />
            </div>
          ) : (
            <div>
              {isError ? (
                <div>Error fetching data</div>
              ) : (
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg mt-4">Days Present</h3>
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">Date</th>
                        <th className="border border-gray-300 px-4 py-2">Login Time</th>
                        <th className="border border-gray-300 px-4 py-2">Logout Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData && performanceData.performance ? (
                        <>
                          {performanceData.performance.actualDaysPresent && performanceData.performance.actualDaysPresent.length > 0 ? (
                            performanceData.performance.actualDaysPresent.map((day, index) => (
                              <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">{day.date}</td>
                                <td className="border border-gray-300 px-4 py-2">{day.loginTime}</td>
                                <td className="border border-gray-300 px-4 py-2">{day.logoutTime}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="border border-gray-300 px-4 py-2 text-center">No days present</td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr>
                          <td colSpan="3" className="border border-gray-300 px-4 py-2 text-center">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Section for Hours Worked and Days Present */}
                  <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                    <h4 className="font-bold text-lg">Summary</h4>
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center">
                        <span className="font-medium">Hours Worked:</span>
                        <span className="ml-2 font-bold text-blue-600">
                          {performanceData?.performance?.hoursWorked.toFixed(2)} hours
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Days Present:</span>
                        <span className="ml-2 font-bold text-blue-600">
                          {performanceData?.performance?.daysPresent || 0}
                        </span>
                      </div>
                    </div>
                  </div>


                  <h3 className="font-bold text-lg mt-4">Days Absent</h3>
                  <table className="min-w-full border border-gray-300 mt-2">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">Metric</th>
                        <th className="border border-gray-300 px-4 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData && performanceData.performance ? (
                        <>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Days Absent</td>
                            <td className="border border-gray-300 px-4 py-2">{performanceData.performance.daysAbsent || 0}</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Actual Dates</td>
                            <td className="border border-gray-300 px-4 py-2 flex flex-wrap gap-2">
                              {performanceData.performance.absentDays && performanceData.performance.absentDays.length > 0 ? (
                                performanceData.performance.absentDays.map((date, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                    {new Date(date).toLocaleDateString(undefined, {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">No days absent</span>
                              )}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan="2" className="border border-gray-300 px-4 py-2 text-center">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>



                  <button onClick={exportToPDF} className={`${styles.button} bg-green-500 text-white py-2 px-4 rounded mt-4`}>
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
