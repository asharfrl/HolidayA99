"use client";
import React, { useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// PENTING: Import ReactApexChart secara dinamis dengan ssr: false
// Ini memperbaiki error "Element type is invalid" saat build
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const BarChartOne: React.FC = () => {
  const [series] = useState([
    {
      name: "Sales",
      data: [44, 55, 41, 67, 22, 43, 65],
    },
    {
      name: "Revenue",
      data: [13, 23, 20, 8, 13, 27, 15],
    },
  ]);

  const [options] = useState<ApexOptions>({
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: "25%",
        dataLabels: {
          total: {
            enabled: false,
            style: {
              fontSize: "13px",
              fontWeight: 900,
            },
          },
        },
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "01/01/2024",
        "02/01/2024",
        "03/01/2024",
        "04/01/2024",
        "05/01/2024",
        "06/01/2024",
        "07/01/2024",
      ],
    },
    legend: {
      position: "right",
      offsetY: 40,
    },
    fill: {
      opacity: 1,
    },
    colors: ["#3C50E0", "#80CAEE"], // Sesuaikan warna dengan tema Anda
  });

  return (
    <div className="col-span-12 rounded-lg border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Bar Chart Analytics
          </h4>
        </div>
      </div>

      <div className="mb-2">
        <div id="barChartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default BarChartOne;