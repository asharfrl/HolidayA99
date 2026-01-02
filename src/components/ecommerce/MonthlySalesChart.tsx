"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// PENTING: Fix yang sama untuk Monthly Sales Chart
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const MonthlySalesChart: React.FC = () => {
  const series = [
    {
      name: "Sales",
      data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
    },
  ];

  const options: ApexOptions = {
    colors: ["#3C50E0"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 2,
        columnWidth: "65%",
        dataLabels: {
            position: 'top', // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
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
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
    },
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div id="monthlyChart">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={180}
        />
      </div>
    </div>
  );
};

export default MonthlySalesChart;