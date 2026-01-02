"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// PENTING: Fix yang sama untuk Statistics Chart
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const StatisticsChart: React.FC = () => {
  const series = [
    {
        name: "Sales",
        data: [18, 25, 35, 25, 28, 35, 40, 45, 50, 55, 60, 65],
    },
  ];

  const options: ApexOptions = {
    colors: ["#3C50E0"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
       <div id="statisticsChart">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </div>
    </div>
  );
};

export default StatisticsChart;