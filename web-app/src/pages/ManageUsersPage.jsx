import React, { useState } from 'react';
import Button from '../components/Button';
import '../styles/ManageUsersPage.css';

const ManageUsersPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [modal, setModal] = useState(false);
    const [modalContent, setModalContent] = useState('nothingyet');
    const [dropdown, setDropdown] = useState(false);

    const toggleDropdown = () => {
        setDropdown(prev => !prev);
    }

    const toggleModal = () => {
        setModal(prev => !prev);
    }

    /* if setActiveTable = staff, render conditional staff table data */
    /* make two different tables with different rows */


    return (
        <>
            <div className='page' id='manageusers'>
                <div className={modal ? 'manageusers-content' : 'manageusers-content modal-active'}>
                    <div className='muc-selection-headers'>
                        <ul>
                            <li
                                className={activeTab === 'users' ? 'muc-link active' : 'muc-link'}
                                onClick={() => setActiveTab('users')}>
                                Users
                            </li> {/* arrow function for logically "onClick(setActiveTab(users))" */}
                            <li
                                className={activeTab === 'staff' ? 'muc-link active' : 'muc-link'}
                                onClick={() => setActiveTab('staff')}>
                                Staff
                            </li>
                        </ul>
                    </div>
                    <div className='manageusers-tab-content'>
                        {activeTab === 'users' && (
                            <div className="tab active">
                                <Button className='muc-add-users-btn' onClick={() => (toggleModal(), setModalContent('Edit'))} children={(<p>
                                    New User
                                </p>)} />
                                <div>
                                    <table className='muc-manageusers-table table-users'>



                                        <thead>
                                            <tr>
                                                <th>First Name</th>
                                                <th>Last Name</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Verification Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className='table-tr'>
                                                <td>John</td>
                                                <td>Appleseed</td>
                                                <td>jappleseed111</td>
                                                <td>jappleseed@example.com</td>
                                                <td>True</td>
                                                <td>
                                                    <div className='td-action'>
                                                        <li
                                                            className='action-li'
                                                            onClick={() => (toggleModal(), setModalContent('Edit'))}
                                                        >
                                                            Edit
                                                        </li>
                                                        <li
                                                            className='action-li dropdown'
                                                            onClick={() => (toggleDropdown())}
                                                        >
                                                            V {/* down arrow */}
                                                        </li>
                                                    </div>
                                                </td> {/* maybe think about making this into a component */}
                                            </tr>
                                            <tr>
                                                <td>Tim</td>
                                                <td>Cheese</td>
                                                <td>cheeset</td>
                                                <td>ilovecheese@example.com</td>
                                                <td>True</td>
                                                <td style={{ textAlign: 'center' }}>Test</td>
                                            </tr>
                                            <tr>
                                                <td>Another</td>
                                                <td>McSampleay</td>
                                                <td>scottmctominayfan</td>
                                                <td>forzaroma1@example.com</td>
                                                <td>True</td>
                                                <td style={{ textAlign: 'center' }}>Test</td>
                                            </tr>
                                        </tbody>

                                    </table>

                                    {modal && modalContent === 'Edit' && (
                                        <div className='modal-container'>
                                            <div className='modal-overlay'></div>
                                            <div className={`modal-content ${modal ? 'show' : ''}`}>
                                                <div className='modal-content-header'>
                                                    <h2>{modalContent} User</h2>
                                                    <li
                                                        className='action-li close'
                                                        onClick={() => (toggleModal())}
                                                    >
                                                        X
                                                    </li>
                                                </div>

                                                <div className='modal-content-body'>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }

                                    {/* {modal && <p> kupal </p> } */}

                                    {console.log('modal:', modal, 'modalContent:', modalContent)}
                                </div>
                            </div>
                        )}
                        {activeTab === 'staff' && (
                            <div className="tab active">
                                <h1>Manage Staff</h1>
                                <p>test</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ManageUsersPage;