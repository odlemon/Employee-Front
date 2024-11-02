  import React, { useEffect } from 'react';
  import { useGetPerformanceRatingQuery } from "../redux/slices/api/taskApiSlice";
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';
  import 'react-datepicker/dist/react-datepicker.css';
  import Spinner from './Spinner'; // Import the spinner component
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
    
        // Table Headers
        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40); // Dark gray for table headers
        const headers = ["Metric", "Value"];
        let startY = 35;
    
        pdf.text(headers[0], 20, startY);
        pdf.text(headers[1], 120, startY);
    
        pdf.line(10, startY + 5, pdfWidth - 10, startY + 5); // Table header underline
    
        // Table Rows
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0); // Black for table values
        if (performanceData && performanceData.performance) {
          const { hoursWorked, daysAbsent, daysPresent } = performanceData.performance;
          const rows = [
            ["Days Worked", daysPresent.toString()],
            ["Days Absent", daysAbsent.toString()],
            ["Total Hours Worked", hoursWorked.toFixed(2)],
          ];
    
          rows.forEach((row, index) => {
            const y = startY + 15 + index * 10;
            pdf.text(row[0], 20, y);      // Metric name
            pdf.text(row[1], 120, y);     // Metric value
          });
        }
    
        // Footer with Current Date
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        const date = new Date().toLocaleDateString();
        pdf.text(`Generated on: ${date}`, 10, pdfHeight - 10);
    
        pdf.save('performance-rating.pdf');
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
                  <>
                    <strong>Overall Rating:</strong>
                    {performanceData && performanceData.performance ? (
                      <>
                        <div><strong>Days Worked:</strong> {performanceData.performance.daysPresent}</div>
                        <div><strong>Days Absent:</strong> {performanceData.performance.daysAbsent}</div>
                        <div><strong>Total Hours Worked:</strong> {performanceData.performance.hoursWorked.toFixed(2)}</div>

                      </>
                    ) : (
                      <div>No performance data available.</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className='flex justify-end mt-4'>
            <button className={`${styles.export} bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700`} onClick={exportToPDF}>
              Export to PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default UserDetailsModal;
