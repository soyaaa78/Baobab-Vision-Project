import React from 'react'
import '../styles/HomePage.css';
import { Link } from 'react-router-dom';
import EyeglassPreview from '../components/EyeglassPreview';
import Button from '../components/Button.jsx';
import { useNavigate } from 'react-router-dom';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

import { Bar, Doughnut, Line } from 'react-chartjs-2';

const HomePage = () => {
    const navigate = useNavigate();
    const handleAdd = () => navigate('/dashboard/addeyeglasses');
    const handleCatalogue = () => navigate('/dashboard/eyeglasses');
    const handleStatistics = () => navigate('/dashboard/statistics');

    return (
        <>
            <div className='page' id='home'>
                <div className='home-content'>

                    <div className='home-left'>

                        <div className='left-hero'>
                            <h1> ¿Cómo estás? </h1>
                            <p>We aren't actually Spanish, the devs who made this.</p>
                            <p>Or maybe we are? You never know ;)</p>

                            <div className='hero-cta-buttons'>
                                <Button className={'home-buttons'} onClick={handleAdd} children={<p>
                                    Add a New Pair
                                </p>} />
                                <Button className={'home-buttons'} /* onClick={sort} */ children={<p>
                                    Delete an Existing Pair
                                </p>} />
                                <Button className={'home-buttons'} /* onClick={sort} */ children={<p>
                                    Edit an Existing Pair
                                </p>} />
                            </div>
                        </div>

                        <div className='left-bottom'>

                            <h2>Statistics</h2>
                            <p>Your number-crunching digest, as usual. Care to take a look?</p>

                            <div className='charts-container'>
                                <div className='chart-bg'>
                                    <div className='charts'>
                                        <Bar
                                            data={{
                                                labels: ["Square", "Circle", "Triangle"],
                                                datasets: [
                                                    {
                                                        label: "Face Shapes",
                                                        data: [10, 18, 16, 20],
                                                        backgroundColor: '#799EE3',
                                                    }
                                                ],
                                            }}
                                        />

                                        <Bar
                                            data={{
                                                labels: ["Square", "Circle", "Triangle"],
                                                datasets: [
                                                    {
                                                        label: "Face Shapes",
                                                        data: [10, 18, 16, 20],
                                                        backgroundColor: '#799EE3',
                                                    }
                                                ],
                                            }}
                                        />


                                    </div>

                                    <div className='quip'>
                                        <p>Want to see more?</p>
                                        <Button className='' onClick={handleStatistics} children={<p>See Statistics</p>} />
                                    </div>
                                </div>
                            </div>



                        </div>

                    </div>

                    <div className='home-right'>

                        <div className='catalogue-preview'>
                            <div className='cattext'>
                                <h2>Manage Eyeglass Selections</h2> {/* put this up pls */}
                                <p>Got something to check out? Look no further.</p>
                            </div>
                            <div className='prevtest'>
                                <div className='preview-bg'>
                                    <div className='preview-items-container'>
                                        <div className='preview-items'>
                                            <EyeglassPreview />
                                            <EyeglassPreview />
                                            <EyeglassPreview />
                                            <EyeglassPreview />
                                            <EyeglassPreview />
                                            <EyeglassPreview />
                                            <EyeglassPreview />
                                            <EyeglassPreview />

                                        </div>
                                    </div>

                                    <div className='quip'>
                                        <p>Want to see more?</p>
                                        <Button className='' onClick={handleCatalogue} children={<p>See Full Catalogue</p>} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default HomePage;