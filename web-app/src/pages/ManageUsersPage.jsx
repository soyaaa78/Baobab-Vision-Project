import React, { useState } from 'react';
import Button from '../components/Button';
import '../styles/ManageUsersPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const ManageUsersPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [modal, setModal] = useState(false);
    const [modalContent, setModalContent] = useState('Add New');
    const [alertModal, setAlertModal] = useState(false);
    const [alertModalContent, setAlertModalContent] = useState('Disable');
    const [dropdown, setDropdown] = useState(false);

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
                <div className='manageusers-content'>
                    <div className='muc-selection-headers'>
                        <ul>
                            <li
                                className={activeTab === 'users' ? 'muc-link active' : 'muc-link'}
                                onClick={() => setActiveTab('users')}>
                                Users
                            </li>
                            <li
                                className={activeTab === 'staff' ? 'muc-link active' : 'muc-link'}
                                onClick={() => setActiveTab('staff')}>
                                Staff
                            </li>
                        </ul>
                    </div>
                    <div className='manageusers-tab-content-container'>
                        {activeTab === 'users' && (
                            <div className="manageusers-tab-content">

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
                                                <td>Verified</td>
                                                <td>
                                                    <div className='td-action'>
                                                        <li
                                                            className='action-li disable'
                                                            onClick={() => (toggleAlertModal(), setAlertModalContent('Disable'))}
                                                        >
                                                            Disable
                                                        </li>
                                                        <li
                                                            className='action-li delete'
                                                            onClick={() => (toggleAlertModal(), setAlertModalContent('Delete'))}
                                                        >
                                                            Delete
                                                        </li>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Tim</td>
                                                <td>Cheese</td>
                                                <td>cheeset</td>
                                                <td>ilovecheese@example.com</td>
                                                <td>Verified</td>
                                                <td style={{ textAlign: 'center' }}>Test</td>
                                            </tr>
                                            <tr>
                                                <td>Another</td>
                                                <td>McSampleay</td>
                                                <td>scottmctominayfan</td>
                                                <td>forzaroma1@example.com</td>
                                                <td>Unverified</td>
                                                <td style={{ textAlign: 'center' }}>Test</td>
                                            </tr>
                                        </tbody>

                                    </table>

                                    {/* past mistake was rendering this absolutely conditionally, so the animations dont show */}


                                    {/* {modal && <p> kupal </p> } */}

                                    {console.log('modal:', modal, 'modalContent:', modalContent)}
                                </div>
                            </div>
                        )}
                        {activeTab === 'staff' && (
                            <div className="manageusers-tab-content">
                                <Button className='muc-add-users-btn' onClick={() => (toggleModal(), setModalContent('Add New'))} children={(<p>
                                    New User
                                </p>)} />
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
                                            <td>Verified</td>
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
                                            <td>Verified</td>
                                            <td style={{ textAlign: 'center' }}>Test</td>
                                        </tr>
                                        <tr>
                                            <td>Another</td>
                                            <td>McSampleay</td>
                                            <td>scottmctominayfan</td>
                                            <td>forzaroma1@example.com</td>
                                            <td>Unverified</td>
                                            <td style={{ textAlign: 'center' }}>Test</td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                        )}

                        <div className={`alert-modal-container ${alertModal ? 'active' : ''}`}>
                            <div className={`modal-overlay ${alertModal ? 'active' : ''}`} />
                            <div className={`alert-modal-content ${alertModal ? 'active' : ''}`}>
                                <div className='alert-modal-content-header'>
                                    <h2>{alertModalContent} User Account</h2>
                                    <li
                                        className='action-li close'
                                        onClick={() => (toggleAlertModal())}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </li>

                                </div>

                                <div className='alert-modal-content-body'>
                                    {alertModalContent === 'Disable' && (
                                        <div className='amcb-disable'>
                                            <p>You are about to <b>disable</b> this account.</p><br />
                                            <p>Disabling this account will render it not usable or accessible by the user unless re-enabled.</p><br />
                                            <p>This action is <i>reversible</i> — you can reactivate the account later if needed.</p>
                                        </div>
                                    )}

                                    {alertModalContent === 'Delete' && (
                                        <div className='amcb-delete'>
                                            <p>You are about to <b>delete</b> this staff account.</p><br />
                                            <p>Deletion of accounts is permanent. This action is <b><u>NOT reversible</u></b> — once deleted, it is gone forever.</p>
                                        </div>
                                    )}


                                    <div className='amcb-continue-cta'>
                                        <p><i>Continue?</i></p>
                                        <Button /* onClick={} */ children={alertModalContent} className={`button-component--alert ${alertModalContent === 'Disable' ? 'alert-disable' :
                                            alertModalContent === 'Delete' ? 'alert-delete' : ''
                                            }`} />

                                        <Button onClick={toggleAlertModal} className='button-component--alert' children={(<div>
                                            <p>Cancel</p>
                                        </div>)} />
                                    </div>

                                    {console.log(alertModalContent)}
                                </div>
                            </div>
                        </div>

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

                                            <Button /* onClick={} */ children={(<div>
                                                <p>Add User</p>
                                            </div>)} />

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
                    </div>
                </div>
            </div>
        </>
    )
}

export default ManageUsersPage;