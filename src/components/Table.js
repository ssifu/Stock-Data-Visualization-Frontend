import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { BsInfoCircle } from 'react-icons/bs';
import Pagination from '@mui/material/Pagination';
import axios from 'axios';

import EditRow from './EditRow';
import StockChart from './StockChart';

const Table = () => {
  const [stockData, setStockData] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [numberOfElements, setNumberOfElements] = useState(10);
  const [dataLength, setDataLength] = useState(10);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [modalFormData, setModalFormData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [tradeCodes, setTradeCodes] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showNormalAlert, setShowNormalAlert] = useState(false);

  const showSuccessAlertWithTimeout = () => {
    setShowSuccessAlert(true);

    // Set a timeout to hide the alert after 3 seconds (3000 milliseconds)
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  const showNormalAlertWithTimeout = () => {
    setShowNormalAlert(true);

    // Set a timeout to hide the alert after 3 seconds (3000 milliseconds)
    setTimeout(() => {
      setShowNormalAlert(false);
    }, 3000);
  };

  const editRow = (updatedRowData) => {
    if (updatedRowData !== 'none') {
      const updatedStockData = stockData.map((data) => {
        if (data.id === updatedRowData.id) {
          return {
            id: updatedRowData.id,
            date: updatedRowData.date,
            trade_code: updatedRowData.trade_code,
            high: updatedRowData.high,
            low: updatedRowData.low,
            open: updatedRowData.open,
            close: updatedRowData.close,
            volume: updatedRowData.volume,
          };
        }

        return data;
      });
      setStockData(updatedStockData);
      showSuccessAlertWithTimeout();
    } else {
      showNormalAlertWithTimeout();
    }
  };

  const deleteRow = async (id) => {
    try {
      const response = await axios.delete(
        `https://ssifu.pythonanywhere.com/sql/delete-stock-data/${id}`,
        { headers: { 'X-CSRFToken': csrfToken } }
      );
      if (response.status === 200) {
        console.log(response.data);
      } else {
        console.error('Error deleting row: ', response.data);
      }
    } catch (error) {
      console.error('Error deleting row: ', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    const fetchData = async () => {
      try {
        // Define the full URL of your Django API endpoint
        const apiUrl = `https://ssifu.pythonanywhere.com/sql/stock-data/?page=${pageNumber}&limit=${numberOfElements}`;

        // Make a GET request to the API using async/await
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response JSON
        const data = await response.json();

        // Set the fetched data to the state
        setStockData(data.data);
        setDataLength(data.total_length);
        setTradeCodes(data.trade_codes);
        setCsrfToken(data.csrf_token);
      } catch (error) {
        console.error('Error fetching data:', error);
        // setLoading(false);
      }
    };

    // Call the async function to fetch data
    fetchData();

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pageNumber, numberOfElements]);

  return (
    <>
      {showSuccessAlert && (
        <div class="fixed right-5 top-5 w-4/12 px-8 py-6 transition-all duration-500 ease-in bg-green-500 font-mono font-bold text-xl text-white flex justify-between rounded">
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7 mr-6"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <p>Success! Row data updated</p>
          </div>
          <button class="text-green-100 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {showNormalAlert && (
        <div class="fixed opacity-100 right-5 top-5 w-4/12 px-8 py-6 bg-blue-400 text-white font-mono font-bold flex justify-between rounded">
          <div class="flex gap-6 items-center">
            <BsInfoCircle className="h-6 w-6 font-bold" />
            <p>No Change Detected</p>
          </div>
          <button class="text-blue-100 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      <h1 className="font-mono text-green-500 text-6xl font-bold text-center mb-8 mx-5">
        Stock Data Information
      </h1>
      <div className="mx-5 md:mx-32 lg:mx-20">
        <StockChart tradeCodes={tradeCodes} />
      </div>
      <div className="font-mono flex flex-col gap-6 justify-between sm:gap-0 sm:flex-row sm:items-center m-5 md:mx-32 lg:mx-20">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="numberOfRows"
            className="block text-lg font-medium text-gray-900 lg:text-xl">
            Number of rows per page:
          </label>
          <select
            name="numberOfRows"
            id="numberOfRows"
            value={numberOfElements}
            className="bg-gray-50 border-4 outline-none border-gray-300 text-gray-900 text-xl rounded-lg focus:ring-blue-500 focus:border-green-500 
        block w-24 md:w-36 p-2.5"
            onChange={(event) => {
              setNumberOfElements(event.target.value);
            }}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Pagination
            className="text-2xl"
            count={Math.round(dataLength / numberOfElements)}
            page={pageNumber}
            onChange={(event, value) => {
              setPageNumber(value);
            }}
          />
          <span className="text-lg">
            Showing {pageNumber * numberOfElements - numberOfElements + 1} -{' '}
            {pageNumber * numberOfElements}
            {' of '}
            {dataLength}
          </span>
        </div>
      </div>
      <div className="font-mono mx-5 md:mx-32 lg:mx-20 lg:mb-5">
        <div className="grid grid-cols-2 lg:flex lg:flex-col bg-white w-full text-xl shadow-md transition-all duration-500 ">
          {isMobile ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-8 text-center bg-blue-400 text-2xl font-bold text-blue-900">
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                Date
              </div>
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                Trade Code
              </div>
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                High
              </div>
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                Low
              </div>
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                Open
              </div>
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                Close
              </div>
              <div className="p-3 flex justify-center items-center border-b border-r border-gray-300">
                Volume
              </div>
              <div className="p-3 flex justify-center items-center border-b border-gray-300">
                Actions
              </div>
            </div>
          )}
          {stockData.length > 0 ? (
            stockData.map((item) => {
              const { id, date, trade_code, high, low, open, close, volume } =
                item;
              return (
                <React.Fragment key={id}>
                  {isMobile ? (
                    <div className="grid grid-cols-1 lg:grid-cols-8 mb-5 lg:mb-0 shadow-md border-2 border-blue-900 xl:text-center bg-blue-400 text-2xl font-bold text-blue-900">
                      <div className="p-3 xl:flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        Date
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        Trade Code
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        High
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        Low
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        Open
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        Close
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-r border-gray-300">
                        Volume
                      </div>
                      <div className="p-3 flex xl:justify-center xl:items-center border-b border-gray-300">
                        Actions
                      </div>
                    </div>
                  ) : null}
                  <div
                    key={id}
                    className="grid grid-cols-1 lg:grid-cols-8 mb-5 lg:mb-0 lg:border-0 lg:shadow-none shadow-md border-2 border-blue-900 text-left text-lg gap-y-0 transition-all duration-500 hover:shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                    <div className="p-2 flex justify-center items-start border-b border-r border-gray-300">
                      {date}
                    </div>
                    <div className="p-2 flex justify-center items-center border-b border-r border-gray-300">
                      {trade_code}
                    </div>
                    <div className="p-2 flex justify-center items-center border-b border-r border-gray-300">
                      {high}
                    </div>
                    <div className="p-2 flex justify-center items-center border-b border-r border-gray-300">
                      {low}
                    </div>
                    <div className="p-2 flex justify-center items-center border-b border-r border-gray-300">
                      {open}
                    </div>
                    <div className="p-2 flex justify-center items-center border-b border-r border-gray-300">
                      {close}
                    </div>
                    <div className="p-2 flex justify-center items-center border-b border-r border-gray-300">
                      {volume}
                    </div>
                    <div className="p-2 flex gap-4 justify-center items-center border-b border-gray-300">
                      <button
                        className="font-medium text-green-500 border-white outline-none hover:underline p-2 rounded-xl transition-all hover:rounded-full hover:bg-green-500 hover:text-white active:scale-50"
                        onClick={() => {
                          setOpenModalEdit(true);
                          setModalFormData({
                            id: id,
                            date: date,
                            trade_code: trade_code,
                            high: high,
                            low: low,
                            open: open,
                            close: close,
                            volume: volume,
                          });
                        }}>
                        <FiEdit />
                      </button>
                      <button
                        className="font-medium text-red-500 border-white outline-none hover:underline p-2 rounded-xl transition-all hover:rounded-full hover:bg-red-500 hover:text-white active:scale-50"
                        onClick={() => {
                          deleteRow(id);
                        }}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          ) : (
            <div className="flex gap-2 justify-center text-center m-2">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold">Data Loading</h1>
            </div>
          )}
        </div>
      </div>
      {openModalEdit ? (
        <EditRow
          openModal={openModalEdit}
          setOpenModal={setOpenModalEdit}
          editRow={editRow}
          {...modalFormData}
        />
      ) : null}
    </>
  );
};

export default Table;
