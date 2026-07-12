import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { MainLayout } from './components/MainLayout'
import { AddEmployee } from './pages/AddEmployee'
import { AssignProject } from './pages/AssignProject'
import { AddSalary } from './pages/AddSalary'
import { AddProject } from './pages/AddProject'
import { AdminDashboard } from './pages/AdminDashboard'
import { LeaveApprovals } from './pages/LeaveApprovals'
import { ProjectsList } from './pages/ProjectsList'
import { EmployeeList } from './pages/EmployeeList'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { ReportsList } from './pages/ReportsList'
import { Login } from './pages/Login'
import RequireRole from './components/RequireRole'
import { Unauthorized } from './pages/Unauthorized'
import SalaryDetails from './pages/SalaryDetails'
import MyProjects from './pages/MyProjects'
import LeaveManagement from './pages/LeaveManagement'

 function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<RequireRole allowedRoles={["ADMIN"]}><AdminDashboard /></RequireRole>} />

          <Route path="my-dashboard" element={<RequireRole allowedRoles={["EMPLOYEE", "ADMIN"]}><EmployeeDashboard /></RequireRole>} />

          <Route path="employees" element={<RequireRole allowedRoles={["ADMIN"]}><EmployeeList /></RequireRole>} />
          <Route path="add-employee" element={<RequireRole allowedRoles={["ADMIN"]}><AddEmployee /></RequireRole>} />
          <Route path="add-project" element={<RequireRole allowedRoles={["ADMIN"]}><AddProject /></RequireRole>} />
          <Route path="admin/projects" element={<RequireRole allowedRoles={["ADMIN"]}><ProjectsList /></RequireRole>} />
          <Route path="admin/leaves" element={<RequireRole allowedRoles={["ADMIN"]}><LeaveApprovals /></RequireRole>} />
          <Route path="add-salary" element={<RequireRole allowedRoles={["ADMIN"]}><AddSalary /></RequireRole>} />
          <Route path="assign-project" element={<RequireRole allowedRoles={["ADMIN"]}><AssignProject /></RequireRole>} />
          <Route path="reports" element={<RequireRole allowedRoles={["ADMIN"]}><ReportsList /></RequireRole>} />

          <Route path="salary-details" element={<RequireRole allowedRoles={["EMPLOYEE","ADMIN"]}><SalaryDetails /></RequireRole>} />
          <Route path="my-projects" element={<RequireRole allowedRoles={["EMPLOYEE","ADMIN"]}><MyProjects /></RequireRole>} />
          <Route path="leave" element={<RequireRole allowedRoles={["EMPLOYEE","ADMIN"]}><LeaveManagement /></RequireRole>} />
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;