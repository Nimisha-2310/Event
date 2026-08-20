import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { apiFetch } from '../utils/api';

const Students = () => {
    const { user, loading: authLoading, showToast } = useAuth();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form inputs state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [course, setCourse] = useState('');
    const [saving, setSaving] = useState(false);

    // Auth gate redirect
    useEffect(() => {
        if (!authLoading && !user) {
            showToast('Please login to access student records', 'warning');
            navigate('/login');
        }
    }, [user, authLoading]);

    const fetchStudents = async () => {
        try {
            const res = await apiFetch('/api/students');
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            } else {
                showToast('Failed to load students data', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Unable to reach server', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStudents();
        }
    }, [user]);

    const resetForm = () => {
        setCurrentId(null);
        setName('');
        setEmail('');
        setAge('');
        setCourse('');
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleOpenEditModal = (student) => {
        setCurrentId(student._id || student.id);
        setName(student.name || '');
        setEmail(student.email || '');
        setAge(String(student.age || ''));
        setCourse(student.course || '');
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = { name, email, age: Number(age), course };
        const method = currentId ? 'PUT' : 'POST';
        const url = currentId ? `/api/students/${currentId}` : '/api/students';

        try {
            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast(
                    currentId ? 'Student record updated successfully' : 'Student added successfully!',
                    'success'
                );
                setModalOpen(false);
                resetForm();
                fetchStudents();
            } else {
                const data = await res.json();
                showToast(data.message || 'Error saving student profile', 'error');
            }
        } catch (err) {
            showToast('Connection failed during update', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student record?')) return;

        try {
            const res = await apiFetch(`/api/students/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('Student record deleted.', 'success');
                fetchStudents();
            } else {
                showToast('Could not delete student record', 'error');
            }
        } catch (e) {
            showToast('Server communications error', 'error');
        }
    };


    if (authLoading || (!user && !authLoading)) {
        return <Loader message="Verifying session gates..." />;
    }

    return (
        <div>
            <div className="page-header" style={{ position: 'relative' }}>
                <h1>Manage Student Directory</h1>
                <p>Register, modify, and delete student academic cohorts</p>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={handleOpenCreateModal}>
                        <i className="bx bx-user-plus"></i>
                        <span>Add New Student</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader message="Loading student files..." />
            ) : (
                <div className="glass-card" style={{ padding: '20px' }}>
                    {students.length > 0 ? (
                        <div className="table-responsive">
                            <table className="crud-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email Address</th>
                                        <th>Age</th>
                                        <th>Enrolled Course</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student._id || student.id}>
                                            <td>{index + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>{student.age} Years</td>
                                            <td>
                                                <span className="profile-badge" style={{ margin: 0, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                                                    {student.course}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div className="actions-cell">
                                                    <button
                                                        className="btn-icon edit-btn"
                                                        onClick={() => handleOpenEditModal(student)}
                                                        title="Edit student"
                                                    >
                                                        <i className="bx bx-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn-icon delete-btn"
                                                        onClick={() => handleDelete(student._id || student.id)}
                                                        title="Delete student"
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>
                            <i className="bx bx-folder-open" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
                            <h3>Student Directory Empty</h3>
                            <p>No student details are saved in the system databases. Click 'Add New Student' to begin.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal popup */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={currentId ? '✏️ Edit Student Info' : '➕ Register Student'}
            >
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Student Name</label>
                        <input
                            type="text"
                            placeholder="Aarav Sharma"
                            className="glass-input"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="aarav@gmail.com"
                            className="glass-input"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-grid" style={{ gap: '15px', marginBottom: 0 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Age</label>
                            <input
                                type="number"
                                placeholder="21"
                                className="glass-input"
                                required
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Enrolled Course</label>
                            <input
                                type="text"
                                placeholder="Information Technology"
                                className="glass-input"
                                required
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ border: 'none', padding: '10px 0 0 0' }}>
                        <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <i className="bx bx-loader-alt bx-spin"></i>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-save"></i>
                                    <span>{currentId ? 'Update Info' : 'Add Student'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
