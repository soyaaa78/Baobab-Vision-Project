import React, { useState } from 'react';
import '../styles/StatisticsPage.css';
import Button from '../components/Button.jsx';
import { PieChart } from '../components/charts/Pie.jsx';
import { LineGraph } from '../components/charts/Line.jsx';
import placeholder from '../assets/placeholder.png';


function StatisticsPage() {
    /* const [count, addCount] = useState(0);

    const handleAdding = () => {
        addCount(count + 1);
    } */

    return (
        <>
            <div className='page' id='statistics'>
                <div className='statistics-content'>
                    <div className='statistics-bulk'>

                        <div className='piesect'>
                            <div className='chart-wrapper'>
                                <PieChart />
                                <p>Oval: { /* ovaldata / totalusers raised limit to 2 decimals %*/}</p>
                            </div>
                        </div>

                        <div className='linesect'>
                            <div className='chart-wrapper'>
                                <LineGraph />
                                <p>Oval: { /* ovaldata / totalusers raised limit to 2 decimals %*/}</p>
                            </div>
                            <div className='chart-wrapper'>
                                <LineGraph />
                                <p>Oval: { /* ovaldata / totalusers raised limit to 2 decimals %*/}</p>
                            </div>

                        </div>

                        <div className='viewsect'>

                            <div className='stat-content' id='view'>
                                <div className='stat-card'>
                                    <div className='stat-card-content'>
                                        <div className='content-text'>
                                            <p className='card-header'>Most Visited Eyewear</p>
                                            <p>reid</p>
                                        </div>

                                        <div className='content-pic'> {/* make responsive */}
                                            <img src={placeholder} alt="" />
                                        </div>
                                    </div>
                                </div>

                                <div className='stat-card'>
                                    <div className='stat-card-content'>
                                        <p className='card-header'>Placeholder 1</p>
                                    </div>
                                </div>

                                <div className='stat-card'>
                                    <div className='stat-card-content'>
                                        <p className='card-header'>Placeholder 2</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default StatisticsPage