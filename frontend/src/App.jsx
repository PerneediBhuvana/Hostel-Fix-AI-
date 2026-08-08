import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import api from './api'
import Layout from './components/Layout'
import StatusBadge from './components/StatusBadge'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const categories = ['Electricity', 'Plumbing', 'Furniture', 'Cleaning', 'Internet', 'Security', 'Water', 'Food', 'Others']
const priorities = ['Low', 'Medium', 'High', 'Urgent']

function Landing() {
  return (
    <div className="container py-5">
      <div className="hero">
        <div className="eyebrow">HOSTEL COMPLAINT MANAGEMENT SYSTEM</div>
        <h1>HOSTELFIX AI</h1>
        <p>Intelligent hostel complaint resolution — from student report to floor coordinator verification, warden assignment, and maintenance resolution.</p>
        <div className="d-flex gap-2 mt-4">
          <Link className="btn btn-primary px-4 py-3" to="/login">Sign in to Portal</Link>
          <Link className="btn btn-outline-dark px-4 py-3" to="/register">Student Registration</Link>
        </div>
      </div>
      <div className="row g-3 mt-4">
        <div className="col-md-3">
          <div className="panel h-100">
            <div className="eyebrow">01 / Student</div>
            <h4 className="mt-3">Raise & Track</h4>
            <p className="text-secondary small">Submit hostel complaints with room & block info and track real-time status.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="panel h-100">
            <div className="eyebrow">02 / Floor Coordinator</div>
            <h4 className="mt-3">Verify & Forward</h4>
            <p className="text-secondary small">Faculty floor coordinators verify genuine complaints and forward to Wardens.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="panel h-100">
            <div className="eyebrow">03 / Warden</div>
            <h4 className="mt-3">Assign Staff</h4>
            <p className="text-secondary small">Wardens assign maintenance staff, prioritize tasks, and close complaints.</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="panel h-100">
            <div className="eyebrow">04 / Maintenance</div>
            <h4 className="mt-3">Resolve & Upload</h4>
            <p className="text-secondary small">Staff complete tasks, upload completion proof images, and submit remarks.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== FIXED AUTH COMPONENT ==========
function Auth({ mode = 'login', onAuthSuccess }) {
  const navigate = useNavigate()
  const register = mode === 'register'
  const forgot = mode === 'forgot'

  const [role, setRole] = useState('student')
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (forgot) {
        const { data } = await api.post('/auth/forgot-password', {
          email: form.email,
          newPassword: form.password
        })
        setSuccess(data.message || 'Password updated successfully! You can now sign in.')
      } else if (register) {
        if (role !== 'student') {
          setError('Self-registration is only allowed for students. Faculty, Warden, Staff, and Admin accounts are pre-provisioned.')
          setLoading(false)
          return
        }
        const payload = { ...form, role: 'student' }
        const { data } = await api.post('/auth/register', payload)
        if (data.accessToken && data.user) {
          localStorage.setItem('hostelfix_token', data.accessToken)
          localStorage.setItem('hostelfix_user', JSON.stringify(data.user))
          if (onAuthSuccess) onAuthSuccess(data.user)
          navigate('/dashboard')
        } else {
          setSuccess('Student account created successfully! Please sign in.')
          setTimeout(() => navigate('/login'), 1500)
        }
      } else {
        const { data } = await api.post('/auth/login', { ...form, role })
        localStorage.setItem('hostelfix_token', data.accessToken)
        localStorage.setItem('hostelfix_user', JSON.stringify(data.user))
        if (onAuthSuccess) onAuthSuccess(data.user)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Role-based message (no hardcoded credentials)
  const getRoleMessage = () => {
    switch (role) {
      case 'student':
        return 'New student? You can register using the link below.'
      case 'faculty':
        return 'Faculty Coordinator accounts are created by the administrator. Please contact the admin.'
      case 'warden':
        return 'Warden accounts are created by the administrator. Please contact the admin.'
      case 'admin':
        return 'Admin accounts are provided by the system administrator.'
      default:
        return ''
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <div className="eyebrow text-warning">HOSTELFIX AI</div>
        <h1 className="mt-3">Intelligent Hostel Complaint System</h1>
        <p className="text-white-50 mt-3">Hierarchical verification: Student → Floor Coordinator → Warden → Maintenance Staff → Resolved.</p>
      </div>
      <div className="auth-card">
        <form className="auth-form" onSubmit={submit}>
          <Link to="/" className="eyebrow">← Back to Home</Link>
          <h2 className="mt-4">
            {forgot ? 'Reset Password' : register ? 'Student Registration' : 'Sign In to Portal'}
          </h2>
          <p className="text-secondary mb-4">
            {forgot ? 'Enter your registered email and new password.' : register ? 'Register as a hostel student resident.' : 'Select your role and enter credentials.'}
          </p>

          {!register && !forgot && (
            <div className="mb-3">
              <label className="form-label d-block text-secondary small">Select Your Role</label>
              <div className="btn-group w-100 flex-wrap gap-1">
                {[
                  ['student', 'Student'],
                  ['faculty', 'Faculty Coordinator'],
                  ['warden', 'Warden'],
                  ['admin', 'Admin']
                ].map(([rKey, rLabel]) => (
                  <button
                    type="button"
                    key={rKey}
                    onClick={() => setRole(rKey)}
                    className={`btn btn-sm ${role === rKey ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    {rLabel}
                  </button>
                ))}
              </div>
            </div>
          )}

          {register && (
            <div className="alert alert-info py-2 small mb-3">
              <strong>Notice:</strong> Only Students can self-register. Other roles are created by administrators.
            </div>
          )}

          {/* ✅ Role-specific informational alert – no hardcoded credentials */}
          {!register && !forgot && (
            <div className="alert alert-info py-2 small mb-3">
              {getRoleMessage()}
            </div>
          )}

          {register && (
            <>
              <label className="form-label">Full Name</label>
              <input required className="form-control mb-3" placeholder="e.g. Rahul Verma" onChange={e => setForm({ ...form, name: e.target.value })} />

              <div className="row">
                <div className="col-6">
                  <label className="form-label">Hostel Block</label>
                  <select required className="form-select mb-3" onChange={e => setForm({ ...form, hostelBlock: e.target.value })}>
                    <option value="">Select Block</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Floor</label>
                  <select required className="form-select mb-3" onChange={e => setForm({ ...form, floor: e.target.value })}>
                    <option value="">Select Floor</option>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="form-label">Room Number</label>
                  <input required className="form-control mb-3" placeholder="e.g. 101" onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label">Phone Number</label>
                  <input required pattern="[0-9+ -]{8,}" className="form-control mb-3" placeholder="9876543210" onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {/* ✅ Generic email placeholder – no hardcoded demo emails */}
          <label className="form-label">Email Address</label>
          <input
            type="email"
            required
            className="form-control mb-3"
            placeholder="your.email@example.com"
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <label className="form-label">{forgot ? 'New Password' : 'Password'}</label>
          <input
            type="password"
            required
            minLength="6"
            className="form-control mb-3"
            placeholder="••••••••"
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}

          <button disabled={loading} className="btn btn-primary w-100 py-3">
            {loading ? 'Processing...' : forgot ? 'Reset Password' : register ? 'Create Student Account' : `Sign In as ${role.toUpperCase()}`}
          </button>

          {/* Forgot password link – visible for all roles (optional) */}
          {!forgot && !register && (
            <div className="text-center mt-3">
              <Link to="/forgot-password" className="small text-secondary">Forgot password?</Link>
            </div>
          )}

          <p className="text-center small text-secondary mt-4">
            {forgot ? (
              <Link to="/login" className="text-success fw-bold">← Back to Sign In</Link>
            ) : register ? (
              <>Already registered? <Link to="/login" className="text-success fw-bold">Sign In</Link></>
            ) : (
              /* ✅ Show registration link only for students */
              role === 'student' ? (
                <>Student looking to register? <Link to="/register" className="text-success fw-bold">Register Here</Link></>
              ) : (
                <span className="text-secondary">Registration is not available for this role.</span>
              )
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
// ========== END OF FIXED AUTH ==========

function Dashboard({ user }) {
  if (!user) return null
  const role = user.role?.toLowerCase()

  const [stats, setStats] = useState({ complaints: 0, pending: 0, approved: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 })
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    (async () => {
      try {
        if (role === 'admin') {
          const rStats = await api.get('/admin/dashboard')
          if (rStats.data?.stats) setStats(rStats.data.stats)
          const rComp = await api.get('/complaints')
          if (rComp.data?.complaints) setComplaints(rComp.data.complaints)
        } else if (role === 'faculty') {
          const rComp = await api.get('/faculty/complaints')
          const list = rComp.data?.complaints || []
          setComplaints(list)
          setStats({
            complaints: list.length,
            pending: list.filter(c => c.status === 'Pending').length,
            approved: list.filter(c => c.status === 'Approved').length,
            resolved: list.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
          })
        } else if (role === 'warden') {
          const rComp = await api.get('/warden/complaints')
          const list = rComp.data?.complaints || []
          setComplaints(list)
          setStats({
            complaints: list.length,
            approved: list.filter(c => c.status === 'Approved').length,
            assigned: list.filter(c => c.status === 'Assigned').length,
            inProgress: list.filter(c => c.status === 'In Progress').length,
            resolved: list.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
          })
        } else if (role === 'staff') {
          const rComp = await api.get('/staff/complaints')
          const list = rComp.data?.complaints || []
          setComplaints(list)
          setStats({
            complaints: list.length,
            assigned: list.filter(c => c.status === 'Assigned').length,
            inProgress: list.filter(c => c.status === 'In Progress').length,
            resolved: list.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
          })
        } else {
          const rComp = await api.get('/complaints?mine=true')
          const list = rComp.data?.complaints || []
          setComplaints(list)
          setStats({
            complaints: list.length,
            pending: list.filter(c => c.status === 'Pending').length,
            inProgress: list.filter(c => ['Approved', 'Assigned', 'In Progress'].includes(c.status)).length,
            resolved: list.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
          })
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    })()
}, [role])

  const categoryCounts = {}
  complaints.forEach(c => {
    const cat = c.category || 'Others'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  })
  const chartLabels = Object.keys(categoryCounts)
  const chartValues = chartLabels.map(l => categoryCounts[l])

  const chartData = {
    labels: chartLabels.length ? chartLabels : ['No Data'],
    datasets: [{ label: 'Complaints by Category', data: chartValues.length ? chartValues : [0], backgroundColor: '#0f766e', borderRadius: 4 }]
  }

  const doughnut = {
    labels: ['Pending', 'Approved', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{ data: [stats.pending || 0, stats.approved || 0, stats.assigned || 0, stats.inProgress || 0, stats.resolved || 0, stats.closed || 0], backgroundColor: ['#f5b88f', '#38bdf8', '#a855f7', '#818cf8', '#22c55e', '#0f766e'], borderWidth: 0 }]
  }

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <div className="eyebrow">HOSTELFIX AI DASHBOARD</div>
          <h1 className="mt-2 mb-0">Welcome, {user.name}</h1>
          <span className="text-secondary small">Role: <strong className="text-capitalize">{user.role}</strong> {user.hostelBlock && `· Block: ${user.hostelBlock}`} {user.floor && `· Floor: ${user.floor}`}</span>
        </div>
        {role === 'student' && (
          <Link to="/complaints/new" className="btn btn-primary">＋ Raise Complaint</Link>
        )}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-caption">Total Complaints</div>
            <div className="stat-value">{stats.complaints || 0}</div>
            <div className="stat-caption">All time</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-caption">{role === 'faculty' ? 'Pending Floor Review' : role === 'warden' ? 'Awaiting Staff Assign' : 'Pending Verification'}</div>
            <div className="stat-value">{role === 'warden' ? (stats.approved || 0) : (stats.pending || 0)}</div>
            <div className="stat-caption">Action required</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-caption">In Progress</div>
            <div className="stat-value">{stats.inProgress || stats.assigned || 0}</div>
            <div className="stat-caption">Under resolution</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-caption">Resolved & Closed</div>
            <div className="stat-value">{stats.resolved || 0}</div>
            <div className="stat-caption">Completed</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="panel">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <h5 className="mb-1">Complaint Distribution</h5>
                <span className="text-secondary small">Breakdown across categories</span>
              </div>
              <span className="eyebrow">HOSTELFIX AI</span>
            </div>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="col-xl-4">
          <div className="panel h-100">
            <h5>Status Breakdown</h5>
            <span className="text-secondary small">Real-time resolution status</span>
            <div className="mt-3">
              <Doughnut data={doughnut} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="panel mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Recent Complaints</h5>
          <Link to={role === 'faculty' ? "/floor-complaints" : role === 'warden' ? "/warden-complaints" : role === 'staff' ? "/assigned" : "/complaints"} className="small text-success">View All →</Link>
        </div>
        <ComplaintTable complaints={complaints.slice(0, 6)} role={role} />
      </div>
    </div>
  )
}

function ComplaintTable({ complaints = [], role = 'student', onRefresh }) {
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [assignStaffId, setAssignStaffId] = useState('')
  const [staffList, setStaffList] = useState([])
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    if (role === 'warden' || role === 'admin') {
      api.get('/admin/staff').then(r => setStaffList(r.data.staff || [])).catch(() => {})
    }
  }, [role])

  const filtered = complaints.filter(item => `${item.title} ${item.category} ${item.status} ${item.block} ${item.floor}`.toLowerCase().includes(query.toLowerCase()))

  const handleFacultyAction = async (id, action) => {
    try {
      await api.patch(`/faculty/complaints/${id}/review`, { action, remarks })
      setActionMsg(`Complaint #${id} ${action}d successfully.`)
      setSelectedItem(null)
      setRemarks('')
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleWardenAssign = async (id) => {
    if (!assignStaffId) return alert('Please select a staff member')
    try {
      await api.post(`/warden/complaints/${id}/assign`, { staffId: assignStaffId, remarks })
      setActionMsg(`Complaint #${id} assigned to staff successfully.`)
      setSelectedItem(null)
      setRemarks('')
      setAssignStaffId('')
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed')
    }
  }

  const handleWardenClose = async (id) => {
    try {
      await api.patch(`/warden/complaints/${id}/close`, { remarks })
      setActionMsg(`Complaint #${id} closed successfully.`)
      setSelectedItem(null)
      setRemarks('')
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close complaint')
    }
  }

  const handleStaffUpdate = async (id, newStatus, imageFile) => {
    try {
      const formData = new FormData()
      formData.append('status', newStatus)
      if (remarks) formData.append('remarks', remarks)
      if (imageFile) formData.append('completionImage', imageFile)

      await api.patch(`/staff/complaints/${id}`, formData)
      setActionMsg(`Complaint #${id} updated to ${newStatus}.`)
      setSelectedItem(null)
      setRemarks('')
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed')
    }
  }

  const handleFeedbackSubmit = async (id) => {
    try {
      await api.post(`/complaints/${id}/feedback`, { rating: feedbackRating, comment: feedbackComment })
      setActionMsg('Thank you! Your feedback has been recorded.')
      setSelectedItem(null)
      setFeedbackComment('')
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.response?.data?.message || 'Feedback submission failed')
    }
  }

  return (
    <>
      {actionMsg && <div className="alert alert-success py-2 mb-3">{actionMsg}</div>}
      <div className="d-flex justify-content-between mb-3">
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Search by title, block, category, status..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title / Resident</th>
              <th>Block & Floor</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td><strong>#{item.id}</strong></td>
                <td>
                  <strong>{item.title}</strong>
                  <small className="d-block text-secondary">By: {item.studentName || 'Student'} (Room {item.roomNo || 'N/A'})</small>
                </td>
                <td>{item.block || 'A'} - Floor {item.floor || '1'}</td>
                <td>{item.category}</td>
                <td><span className={`badge ${item.priority === 'High' || item.priority === 'Urgent' ? 'bg-danger' : 'bg-secondary'}`}>{item.priority}</span></td>
                <td><StatusBadge status={item.status} /></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedItem(item)}>View / Action</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan="7">
                  <div className="empty">No complaints found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal / Drawer */}
      {selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complaint #{selectedItem.id}: {selectedItem.title}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedItem(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="stat-caption">Resident Student</div>
                    <strong>{selectedItem.studentName}</strong> ({selectedItem.block}, Floor {selectedItem.floor}, Room {selectedItem.roomNo})
                  </div>
                  <div className="col-md-6">
                    <div className="stat-caption">Status & Priority</div>
                    <StatusBadge status={selectedItem.status} /> <span className="ms-2 badge bg-secondary">{selectedItem.priority}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="stat-caption">Description</div>
                  <p className="border rounded p-2 bg-light">{selectedItem.description}</p>
                </div>

                {selectedItem.imageUrl && (
                  <div className="mb-3">
                    <div className="stat-caption">Attached Photo Proof</div>
                    <img src={selectedItem.imageUrl} alt="Complaint Evidence" className="img-thumbnail" style={{ maxHeight: 200 }} />
                  </div>
                )}

                {selectedItem.facultyRemarks && (
                  <div className="mb-2 p-2 border-start border-info bg-light">
                    <small className="d-block text-info fw-bold">Floor Coordinator Remarks:</small>
                    <span>{selectedItem.facultyRemarks}</span>
                  </div>
                )}

                {selectedItem.wardenRemarks && (
                  <div className="mb-2 p-2 border-start border-primary bg-light">
                    <small className="d-block text-primary fw-bold">Warden Remarks:</small>
                    <span>{selectedItem.wardenRemarks}</span>
                  </div>
                )}

                {selectedItem.staffRemarks && (
                  <div className="mb-2 p-2 border-start border-warning bg-light">
                    <small className="d-block text-warning fw-bold">Maintenance Staff Remarks:</small>
                    <span>{selectedItem.staffRemarks}</span>
                  </div>
                )}

                {selectedItem.completionImageUrl && (
                  <div className="mb-3">
                    <div className="stat-caption">Completion Proof Photo</div>
                    <img src={selectedItem.completionImageUrl} alt="Completion Proof" className="img-thumbnail" style={{ maxHeight: 200 }} />
                  </div>
                )}

                {selectedItem.feedback && (
                  <div className="p-2 border-start border-success bg-light mb-3">
                    <small className="d-block text-success fw-bold">Student Feedback (Rating: {selectedItem.feedback.rating}/5 ⭐):</small>
                    <span>{selectedItem.feedback.comment || 'No comment provided'}</span>
                  </div>
                )}

                {/* Role Specific Action Inputs */}
                {role === 'faculty' && selectedItem.status === 'Pending' && (
                  <div className="mt-4 border-top pt-3">
                    <h6>Floor Coordinator Verification</h6>
                    <label className="form-label">Add Verification Remarks</label>
                    <textarea className="form-control mb-3" rows="2" placeholder="e.g. Genuine complaint verified on Floor 1." value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success" onClick={() => handleFacultyAction(selectedItem.id, 'approve')}>✓ Approve & Forward to Warden</button>
                      <button className="btn btn-danger" onClick={() => handleFacultyAction(selectedItem.id, 'reject')}>✗ Reject Complaint</button>
                    </div>
                  </div>
                )}

                {(role === 'warden' || role === 'admin') && selectedItem.status === 'Approved' && (
                  <div className="mt-4 border-top pt-3">
                    <h6>Assign Maintenance Staff</h6>
                    <label className="form-label">Select Staff Member</label>
                    <select className="form-select mb-3" value={assignStaffId} onChange={e => setAssignStaffId(e.target.value)}>
                      <option value="">Choose Staff</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.department || s.email})</option>
                      ))}
                    </select>
                    <label className="form-label">Warden Assignment Remarks</label>
                    <textarea className="form-control mb-3" rows="2" placeholder="Instructions for maintenance staff..." value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
                    <button className="btn btn-primary" onClick={() => handleWardenAssign(selectedItem.id)}>Assign Staff Member</button>
                  </div>
                )}

                {(role === 'warden' || role === 'admin') && (selectedItem.status === 'Resolved' || selectedItem.status === 'In Progress') && (
                  <div className="mt-4 border-top pt-3">
                    <h6>Close Complaint Verification</h6>
                    <textarea className="form-control mb-3" rows="2" placeholder="Final verification remarks..." value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
                    <button className="btn btn-dark" onClick={() => handleWardenClose(selectedItem.id)}>✓ Mark Complaint as Closed</button>
                  </div>
                )}

                {role === 'staff' && (selectedItem.status === 'Assigned' || selectedItem.status === 'In Progress') && (
                  <div className="mt-4 border-top pt-3">
                    <h6>Update Resolution Progress</h6>
                    <label className="form-label">Staff Work Remarks</label>
                    <textarea className="form-control mb-3" rows="2" placeholder="Details of work completed..." value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
                    <label className="form-label">Upload Completion Proof Photo (Optional)</label>
                    <input type="file" accept="image/*" className="form-control mb-3" id="compImgInput" />
                    <div className="d-flex gap-2">
                      <button className="btn btn-warning" onClick={() => handleStaffUpdate(selectedItem.id, 'In Progress')}>Mark In Progress</button>
                      <button className="btn btn-success" onClick={() => handleStaffUpdate(selectedItem.id, 'Resolved', document.getElementById('compImgInput')?.files[0])}>Mark Work as Completed / Resolved</button>
                    </div>
                  </div>
                )}

                {role === 'student' && (selectedItem.status === 'Resolved' || selectedItem.status === 'Closed') && !selectedItem.feedback && (
                  <div className="mt-4 border-top pt-3">
                    <h6>Give Feedback & Rating</h6>
                    <div className="mb-3">
                      <label className="form-label">Rating (1 to 5 Stars)</label>
                      <select className="form-select" value={feedbackRating} onChange={e => setFeedbackRating(e.target.value)}>
                        <option value="5">5 Stars - Excellent Service</option>
                        <option value="4">4 Stars - Good Work</option>
                        <option value="3">3 Stars - Average</option>
                        <option value="2">2 Stars - Poor</option>
                        <option value="1">1 Star - Very Poor</option>
                      </select>
                    </div>
                    <label className="form-label">Comments</label>
                    <textarea className="form-control mb-3" rows="2" placeholder="Was the issue resolved to your satisfaction?" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)}></textarea>
                    <button className="btn btn-success" onClick={() => handleFeedbackSubmit(selectedItem.id)}>Submit Feedback</button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedItem(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Complaints({ user }) {
  if (!user) return null
  const [complaints, setComplaints] = useState([])

  const loadData = () => {
    api.get('/complaints')
      .then(r => setComplaints(r.data?.complaints || []))
      .catch(err => console.error('Failed to load complaints:', err))
  }

  useEffect(() => { loadData() }, [user.role])

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <div className="eyebrow">COMPLAINT MANAGEMENT</div>
          <h1 className="mt-2">Hostel Complaints History</h1>
        </div>
        {user.role === 'student' && (
          <Link to="/complaints/new" className="btn btn-primary">＋ Raise Complaint</Link>
        )}
      </div>
      <div className="panel">
        <ComplaintTable complaints={complaints} role={user.role} onRefresh={loadData} />
      </div>
    </div>
  )
}

function NewComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ priority: 'Medium' })
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => value && body.append(key, value))
      await api.post('/complaints', body)
      navigate('/complaints')
    } catch (err) {
      console.error('Complaint submit error:', err)
      const serverMsg = err?.response?.data?.message
      const status = err?.response?.status
      setError(serverMsg ? `Error ${status}: ${serverMsg}` : (err.message || 'Could not submit complaint'))
    }
  }

  return (
    <div className="page">
      <div className="mb-4">
        <div className="eyebrow">Resident Portal / New Request</div>
        <h1 className="mt-2">Raise a Hostel Complaint</h1>
        <p className="text-secondary">Your complaint will be forwarded to your assigned Floor Coordinator for verification.</p>
      </div>
      <div className="panel" style={{ maxWidth: 760 }}>
        <form onSubmit={submit}>
          <label className="form-label">Complaint Title</label>
          <input required className="form-control mb-3" placeholder="e.g. Water leak in washroom / Tap broken" onChange={e => setForm({ ...form, title: e.target.value })} />

          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Hostel Block</label>
              <select required className="form-select mb-3" onChange={e => setForm({ ...form, block: e.target.value })}>
                <option value="">Choose Block</option>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Floor</label>
              <select required className="form-select mb-3" onChange={e => setForm({ ...form, floor: e.target.value })}>
                <option value="">Choose Floor</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Room Number</label>
              <input required className="form-control mb-3" placeholder="101" onChange={e => setForm({ ...form, roomNo: e.target.value })} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select required className="form-select mb-3" onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Choose Category</option>
                {categories.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Priority</label>
              <select className="form-select mb-3" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {priorities.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <label className="form-label">Detailed Description</label>
          <textarea required className="form-control mb-3" rows="4" placeholder="Describe the issue in detail..." onChange={e => setForm({ ...form, description: e.target.value })} />

          <label className="form-label">Photo Evidence <span className="text-secondary fw-normal">(Optional)</span></label>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="form-control mb-4" onChange={e => setForm({ ...form, image: e.target.files[0] })} />

          {error && <div className="alert alert-danger">{error}</div>}
          <button className="btn btn-primary px-4 py-2">Submit Complaint</button>
        </form>
      </div>
    </div>
  )
}

function ReportsPage() {
  const [reports, setReports] = useState(null)

  useEffect(() => {
    api.get('/admin/reports')
      .then(r => setReports(r.data))
      .catch(err => console.error('Failed to load reports:', err))
  }, [])

  if (!reports) return <div className="page"><div className="panel p-4">Loading reports analytics...</div></div>

  return (
    <div className="page">
      <div className="eyebrow">ADMINISTRATION & ANALYTICS</div>
      <h1 className="mt-2 mb-4">HOSTELFIX AI Reports & Analytics Workspace</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="panel h-100">
            <h5>Hostel Block Wise Summary</h5>
            <div className="table-responsive mt-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hostel Block</th>
                    <th>Total</th>
                    <th>Pending</th>
                    <th>Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.blocks?.map((b, i) => (
                    <tr key={i}>
                      <td><strong>{b.block}</strong></td>
                      <td>{b.total}</td>
                      <td><span className="badge bg-warning text-dark">{b.pending}</span></td>
                      <td><span className="badge bg-success">{b.resolved}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel h-100">
            <h5>Category Breakdown</h5>
            <div className="table-responsive mt-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Complaints Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.categories?.map((c, i) => (
                    <tr key={i}>
                      <td>{c.category}</td>
                      <td><strong>{c.total}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="panel h-100">
            <h5>Faculty (Floor Coordinator) Performance</h5>
            <div className="table-responsive mt-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>Handled Complaints</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.facultyPerformance?.map((f, i) => (
                    <tr key={i}>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.handled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel h-100">
            <h5>Maintenance Staff Performance</h5>
            <div className="table-responsive mt-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.staffPerformance?.map((s, i) => (
                    <tr key={i}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.assigned}</td>
                      <td><span className="badge bg-success">{s.completed}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserManagementPage({ title, roleFilter }) {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ role: roleFilter || 'staff' })

  const loadUsers = () => {
    const endpoint = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users'
    api.get(endpoint)
      .then(r => setUsers(r.data.users || r.data.students || r.data.staff || []))
      .catch(err => console.error('Failed to load users:', err))
  }

  useEffect(() => { loadUsers() }, [roleFilter])

  const handleAddUser = async e => {
    e.preventDefault()
    try {
      await api.post('/admin/users', form)
      setShowForm(false)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user')
    }
  }

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="eyebrow">USER MANAGEMENT</div>
          <h1 className="mt-2">{title}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>＋ Add User Account</button>
      </div>

      {showForm && (
        <div className="panel mb-4">
          <h5>Create New Predefined Account</h5>
          <form onSubmit={handleAddUser} className="mt-3">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Full Name</label>
                <input required className="form-control mb-3" onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input type="email" required className="form-control mb-3" onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Password</label>
                <input type="password" required className="form-control mb-3" onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Role</label>
                <select className="form-select mb-3" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="faculty">Faculty (Floor Coordinator)</option>
                  <option value="warden">Warden</option>
                  <option value="staff">Maintenance Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Hostel Block</label>
                <input className="form-control mb-3" placeholder="Block A" onChange={e => setForm({ ...form, hostelBlock: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Floor</label>
                <input className="form-control mb-3" placeholder="1" onChange={e => setForm({ ...form, floor: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Department / Specialty</label>
                <input className="form-control mb-3" placeholder="Plumbing / Electrical" onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-success">Save User Account</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Block & Floor</th>
                <th>Department / Specialty</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="badge bg-secondary text-capitalize">{u.role}</span></td>
                  <td>{u.hostelBlock ? `${u.hostelBlock} ${u.floor ? `(Floor ${u.floor})` : ''}` : 'N/A'}</td>
                  <td>{u.department || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Profile({ user }) {
  if (!user) return null
  return (
    <div className="page">
      <div className="eyebrow">USER PROFILE</div>
      <h1 className="mt-2">Profile & Settings</h1>
      <div className="panel mt-4" style={{ maxWidth: 720 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="brand-mark" style={{ width: 56, height: 56, fontSize: 24 }}>{user.name?.[0] || 'U'}</div>
          <div>
            <h4 className="mb-1">{user.name}</h4>
            <span className="text-secondary text-capitalize">{user.role} Account</span>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="stat-caption">Email Address</div>
            <strong>{user.email}</strong>
          </div>
          <div className="col-md-6">
            <div className="stat-caption">Phone</div>
            <strong>{user.phone || 'N/A'}</strong>
          </div>
          <div className="col-md-6">
            <div className="stat-caption">Hostel Block & Floor</div>
            <strong>{user.hostelBlock ? `${user.hostelBlock} ${user.floor ? `(Floor ${user.floor})` : ''}` : 'N/A'}</strong>
          </div>
          <div className="col-md-6">
            <div className="stat-caption">Room / Department</div>
            <strong>{user.roomNo ? `Room ${user.roomNo}` : user.department || 'N/A'}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

function Protected({ user, onLogout, children }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    return () => document.body.classList.remove('dark-mode')
  }, [darkMode])

  return user ? (
    <Layout user={user} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={onLogout}>
      {children}
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  )
}

function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={<Auth mode="login" onAuthSuccess={setUser} />} />
      <Route path="/register" element={<Auth mode="register" onAuthSuccess={setUser} />} />
      <Route path="/forgot-password" element={<Auth mode="forgot" />} />
      <Route path="/dashboard" element={<Protected user={user} onLogout={() => setUser(null)}><Dashboard user={user} /></Protected>} />
      <Route path="/complaints" element={<Protected user={user} onLogout={() => setUser(null)}><Complaints user={user} /></Protected>} />
      <Route path="/floor-complaints" element={<Protected user={user} onLogout={() => setUser(null)}><Complaints user={user} /></Protected>} />
      <Route path="/warden-complaints" element={<Protected user={user} onLogout={() => setUser(null)}><Complaints user={user} /></Protected>} />
      <Route path="/assigned" element={<Protected user={user} onLogout={() => setUser(null)}><Complaints user={user} /></Protected>} />
      <Route path="/complaints/new" element={<Protected user={user} onLogout={() => setUser(null)}><NewComplaint /></Protected>} />
      <Route path="/profile" element={<Protected user={user} onLogout={() => setUser(null)}><Profile user={user} /></Protected>} />
      <Route path="/students" element={<Protected user={user} onLogout={() => setUser(null)}><UserManagementPage title="Students Directory" roleFilter="student" /></Protected>} />
      <Route path="/staff" element={<Protected user={user} onLogout={() => setUser(null)}><UserManagementPage title="Faculty, Wardens & Staff Directory" /></Protected>} />
      <Route path="/reports" element={<Protected user={user} onLogout={() => setUser(null)}><ReportsPage /></Protected>} />
      <Route path="*" element={<div className="container py-5"><h1>404</h1><Link to="/">Return to Home</Link></div>} />
    </Routes>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hostelfix_user') || localStorage.getItem('haven_user') || 'null')
    } catch {
      return null
    }
  })

  return (
    <BrowserRouter>
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  )
}