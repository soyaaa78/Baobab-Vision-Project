import React, { useState } from 'react';
import '../../styles/eyeglass/EyeglassPage.css';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import EyeglassPreview from '../../components/EyeglassPreview.jsx';

const EyeglassPage = () => {
    const navigate = useNavigate();
    const handleAdd = () => navigate('/dashboard/addeyeglasses');
    const [deleteMode, setDeleteMode] = useState(false);

    const handleToggleDeleteMode = () => {
        setDeleteMode(prev => !prev);
    }

    return (
        <>
            <div className='page' id='catalogue'>
                <div className='catalogue-content'> 

                    <div className='catalogue-bulk'>

                        <div className='topbar'> 
                            <div className='search'>
                                <div className='options'>
                                    <div className='options-cta'>
                                        <Button className='options-action-buttons' onClick={handleAdd} children={<p>
                                            Add Pair
                                        </p>} />
                                        <Button
                                            className={`options-action-buttons ${deleteMode ? 'active-delete-button' : ''}`}
                                            onClick={handleToggleDeleteMode}
                                            children={
                                                <p>Delete Pair</p>
                                            } />
                                        <Button className='options-action-buttons' /* onClick={sort} */ children={<p>
                                            Edit Pair
                                        </p>} />
                                    </div>
                                    <div className='options-sorting'>
                                        <p>Sort By:</p>
                                        <Button className='options-sort-buttons' /* onClick={sort} */ children={<p>
                                            Latest
                                        </p>} />
                                        <Button className='options-sort-buttons' /* onClick={sort} */ children={<p>
                                            Oldest
                                        </p>} />
                                        <Button className='options-sort-buttons' /* onClick={sort} */ children={<p>
                                            Price
                                        </p>} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='selections'> {/* bordered section here as well (scroll down ka sa cosmos landing page) */}
                            <div className='selections-grid'>
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                                <EyeglassPreview className='eyeglass-listing--catalogue' deleteMode={deleteMode} />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default EyeglassPage;