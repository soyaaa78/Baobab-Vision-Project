import React, { useState } from 'react';
import Button from '../components/Button';
import '../styles/ManageUsersPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const ManageUsersPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [modal, setModal] = useState(false);
    const [modalContent, setModalContent] = useState('Add New');
    const [dropdown, setDropdown] = useState(false);
    const [alertModal, setAlertModal] = useState(false);

    const toggleAlertModal = () => {
        setAlertModal(prev => !prev);
    }

    const toggleDropdown = () => {
        setDropdown(prev => !prev);
    }

    const toggleModal = () => {
        setModal(prev => !prev);
    }

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
                                <Button className='muc-add-users-btn' onClick={() => (toggleModal(), setModalContent('Add New'))} children={(<p>
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
                                                        <div className='td-action-dropdown'>
                                                            <li
                                                                className={`action-li dropdown ${dropdown ? 'retractable' : ''}`}
                                                                onClick={() => (toggleDropdown())}
                                                            >
                                                                <FontAwesomeIcon icon={faCaretDown} />
                                                            </li>
                                                            <div className={`td-action-dropdown-menu ${dropdown ? 'active' : ''}`}>
                                                                <div className='dropdown-menu-options'>
                                                                    <li className='action-li'>
                                                                        Orders
                                                                    </li>
                                                                    <li className='action-li disable'>
                                                                        Disable User
                                                                    </li>
                                                                    <li className='action-li delete'>
                                                                        Delete Account
                                                                    </li>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
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

                                    {/* past mistake was rendering this absolutely conditionally, so the animations dont show */}
                                    <div className={`modal-container ${modal ? 'active' : ''}`}>
                                        <div className={`modal-overlay ${modal ? 'active' : ''}`} />
                                        <div className={`modal-content ${modal ? 'show' : ''}`}>
                                            <div className='modal-content-header'>
                                                <h2>{modalContent} User</h2>
                                                <li
                                                    className='action-li close'
                                                    onClick={() => (toggleModal())}
                                                >
                                                    <FontAwesomeIcon icon={faXmark} />
                                                </li>
                                            </div>

                                            <div className='modal-content-body'>

                                                {modal && modalContent === 'Add New' && (
                                                    <div className='modal-body-container' id='add'>

                                                        <div className="add-text">
                                                            <p>Upon addition, the user shall be sent a confirmation email to confirm their identity.</p>
                                                        </div>

                                                        <div className="mcb-body-container">
                                                            <form className='mcb-body' id='add' action="" method="post">

                                                                <div className="mu-modal-input modal-name" id='abn-firstname'>
                                                                    <label for="firstname">First Name</label>
                                                                    <input type="text" name="firstname" id="firstname" />
                                                                </div>

                                                                <div className="mu-modal-input modal-name" id='abn-lastname'>
                                                                    <label for="lastname">Last Name</label>
                                                                    <input type="text" name="lastname" id="lastname" />
                                                                </div>

                                                                <div className="mu-modal-input modal-name" id='abn-username'>
                                                                    <label for="username">Username</label>
                                                                    <input type="text" name="username" id="username" />
                                                                </div>

                                                                <div className="mu-modal-input modal-email">
                                                                    <label for="add-email">Email</label>
                                                                    <input type="email" name="add-email" id="add-email" />
                                                                </div>

                                                            </form>
                                                        </div>

                                                        <div className="add-text">
                                                            <p>The user's default password will be set to <b>B40b4b2025!</b> <i>(exclamation point included).</i>
                                                                <br />
                                                                They shall be ordered to change their password once fully verified within the Baobab Vision mobile app.
                                                            </p>
                                                        </div>


                                                    </div>
                                                )}

                                                {modal && modalContent === 'Edit' && (
                                                    <div className='modal-body-container' id='edit'>

                                                        <div className="mcb-body-container">
                                                            <form className='mcb-body' id='edit' action="" method="post">

                                                                <div className="mu-modal-input modal-name" id='ebn-firstname'>
                                                                    <label for="firstname">First Name</label>
                                                                    <input type="text" name="firstname" id="firstname" value={'fn'} />
                                                                </div>

                                                                <div className="mu-modal-input modal-name" id='ebn-lastname'>
                                                                    <label for="lastname">Last Name</label>
                                                                    <input type="text" name="lastname" id="lastname" value={'ln'} />
                                                                </div>

                                                                <div className="mu-modal-input modal-name" id='ebn-username'>
                                                                    <label for="username">Username</label>
                                                                    <input type="text" name="username" id="username" value={'un'} />
                                                                </div>

                                                                <div className="mu-modal-input modal-email">
                                                                    <label for="edit-email">Email</label>
                                                                    <input type="email" name="edit-email" id="edit-email" value={'email'} />
                                                                </div>

                                                            </form>
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

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