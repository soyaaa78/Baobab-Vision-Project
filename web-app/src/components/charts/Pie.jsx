import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, ArcElement } from "chart.js";
import { pieChartData } from "../../data/testdata.js";

ChartJS.register(Tooltip, ArcElement);

export const PieChart = () => {
    const options = {};

    return <Pie options={options} data={pieChartData}/>
}