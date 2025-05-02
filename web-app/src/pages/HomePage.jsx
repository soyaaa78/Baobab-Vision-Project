import React from 'react'
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import EyeglassPreview from '../components/EyeglassPreview';
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

function HomePage() {
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
                                <Link to='home' className='home-button' id='home1'>Add a New Pair</Link>
                                <Link to='home' className='home-button' id='home2'>Delete an Existing Pair</Link>
                                <Link to='/dashboard/editeyeglasses' className='home-button' id='home3'>Edit an Existing Pair</Link>
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
                                        <div className='stats-button-container'>
                                            <Link to='statistics' className='home-button' id='stats-cta'>View Full Statistics</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>



                        </div>

                    </div>

                    <div className='home-right'>

                        <div className='catalogue-preview'>
                            <div className='preview-bg'>
                                <p>Manage Eyeglass Selections</p>
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
                                    <div className='stats-button-container'> {/* change to button */}
                                        <Link to='statistics' className='home-button' id='stats-cta'>View Full Catalogue</Link>
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