import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SchedulePage() {
  const [trains, setTrains] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const trainsPerPage = 10;

  // 🔄 Fetch trains from backend every 10 sec
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/schedule");
        const data = await response.json();
        setTrains(data.data.trains || []);
      } catch (err) {
        console.error("Error fetching trains:", err);
      }
    };

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Status color function
  const getStatusColor = (status) => {
    if (status.toLowerCase().includes("delayed")) return "text-red-600 font-bold";
    if (status.toLowerCase().includes("early")) return "text-blue-600 font-bold";
    if (status.toLowerCase().includes("scheduled")) return "text-yellow-600 font-bold";
    return "text-green-600 font-bold"; // On Time
  };

  // ✅ Search filter
  const filteredTrains = trains.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.direction.toLowerCase().includes(search.toLowerCase()) ||
      t.status.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Pagination
  const indexOfLastTrain = currentPage * trainsPerPage;
  const indexOfFirstTrain = indexOfLastTrain - trainsPerPage;
  const currentTrains = filteredTrains.slice(indexOfFirstTrain, indexOfLastTrain);
  const totalPages = Math.ceil(filteredTrains.length / trainsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-semibold text-center mb-6">
          🚆 Live Train Schedule – Dum Dum Junction
        </h2>

        {/* 🔍 Search */}
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Search train, direction, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm w-1/2"
          />
        </div>

        {/* 📋 Table */}
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Train No</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Arrives</th>
                <th className="border border-gray-300 px-4 py-2">Departs</th>
                <th className="border border-gray-300 px-4 py-2">Duration</th>
                <th className="border border-gray-300 px-4 py-2">Direction</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTrains.map((train) => (
                <tr key={train.trainNo} className="hover:bg-gray-100 text-center">
                  <td className="border border-gray-300 px-4 py-2">{train.trainNo}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.arrives}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.departs}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.duration}</td>
                  <td className="border border-gray-300 px-4 py-2">{train.direction}</td>
                  <td className={`border border-gray-300 px-4 py-2 ${getStatusColor(train.status)}`}>
                    {train.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔄 Pagination */}
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
