import AppContext from '@/src/AppContext/Context';
import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Entity = () => {
  const { hasPermission, user, checkRole } = useContext(AppContext);
  const Users = React.lazy(() => import('@/src/pages/Users'));
  const User = React.lazy(() => import('@/src/pages/Users/User'));
  const UserView = React.lazy(() => import('@/src/pages/Users/View'));

  const Companies = React.lazy(() => import('@/src/pages/Companies'));
  const Company = React.lazy(() => import('@/src/pages/Companies/Company'));

  const Students = React.lazy(() => import('@/src/pages/Students'));
  const Student = React.lazy(() => import('@/src/pages/Students/Student'));

  const NotificationTemplates = React.lazy(() => import('@/src/pages/NotificationTemplates'));

  const Instructors = React.lazy(() => import('@/src/pages/Instructors'));
  const Instructor = React.lazy(() => import('@/src/pages/Instructors/Instructor'));
  const InstructorView = React.lazy(() => import('@/src/pages/Instructors/View'));

  const Courses = React.lazy(() => import('@/src/pages/Courses'));
  const Course = React.lazy(() => import('@/src/pages/Courses/Course'));
  const CourseV2 = React.lazy(() => import('@/src/pages/Courses/CourseV2'));
  const CourseV4 = React.lazy(() => import('@/src/pages/Courses/CourseV4'));
  const CourseCadastrar = React.lazy(() => import('@/src/pages/Courses/Cadastrar'));
  const CourseView = React.lazy(() => import('@/src/pages/Courses/View'));
  const CourseEdit = React.lazy(() => import('@/src/pages/Courses/Edit'));

  const Positions = React.lazy(() => import('@/src/pages/Positions'));
  const Position = React.lazy(() => import('@/src/pages/Positions/Position'));

  const DocumentTemplates = React.lazy(() => import('@/src/pages/DocumentTemplates'));
  const DocumentTemplate = React.lazy(() => import('@/src/pages/DocumentTemplates/DocumentTemplate'));

  const DocumentGenerate = React.lazy(() => import('@/src/pages/Documents/Generate'));
  const Documents = React.lazy(() => import('@/src/pages/Documents'));
  const DocumentView = React.lazy(() => import('@/src/pages/Documents/DocumentView'));
  const NotFound = React.lazy(() => import('@/src/pages/NotFound'));

  const Checkout = React.lazy(() => import('@/src/pages/Checkout'));
  const PaymentDetails = React.lazy(() => import('@/src/pages/PaymentDetails'));

  const Events = React.lazy(() => import('@/src/pages/Events'));
  const EventForm = React.lazy(() => import('@/src/pages/Events/Event'));
  const EventView = React.lazy(() => import('@/src/pages/Events/View'));

  // Dashboard
  const Dashboard = React.lazy(() => import('@/src/pages/Dashboard'));
  const Profile = React.lazy(() => import('@/src/pages/Profile'));
  const Notifications = React.lazy(() => import('@/src/pages/Notifications'));

  const ConfirmationCode = React.lazy(() => import('@/src/pages/ConfirmationCode'));

  if (!user?.email_verified_at) {
    return (
      <React.Suspense>
        <Routes>
          <Route path={`/confirmation-code`} element={<ConfirmationCode />} />
          <Route path={'/not-found'} element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
      </React.Suspense>
    );
  }

  const accessUser = () => {
    if (checkRole('Master')) return true;
    if (checkRole('Company') && user?.is_main_user) return true;
    if (checkRole('Entity') && user?.entity?.config?.main_user?.id === user?.id) return true;

    return false;
  }

  return (
    <React.Suspense>
      <Routes>
        <Route path={`/dashboard`} element={<Dashboard />} />
        <Route path={`/profile`} element={<Profile />} />
        <Route path={`/users`} element={<Users />} />
        <Route path={`/checkout`} element={<Checkout />} />
        <Route path={`/payment-status`} element={<PaymentDetails />} />
        {accessUser() && hasPermission('Cadastrar') && <Route path={`/users/create`} element={<User />} />}
        {accessUser() && hasPermission('Atualizar') && <Route path={`/users/:userId/view`} element={<UserView />} />}
        {accessUser() && hasPermission('Atualizar') && <Route path={`/users/:userId`} element={<User />} />}

        <Route path={`/companies`} element={<Companies />} />
        {hasPermission('Cadastrar') && <Route path={`/companies/create`} element={<Company />} />}
        {hasPermission('Atualizar') && <Route path={`/companies/:companyId`} element={<Company />} />}

        {hasPermission('Atualizar') && <Route path={`/companies/:companyId/students/:studentId`} element={<Student />} />}
        {hasPermission('Cadastrar') && <Route path={`/companies/:companyId/students/create`} element={<Student />} />}

        {hasPermission('Atualizar') && <Route path={`/students/:studentId`} element={<Student />} />}
        <Route path={`/students`} element={<Students />} />
        {hasPermission('Cadastrar') && <Route path={`/students/create`} element={<Student />} />}
        <Route path={`/companies/:companyId/students`} element={<Students />} />
        {hasPermission('Atualizar') && <Route path={`/companies/:companyId/students/:studentId`} element={<Student />} />}
        {hasPermission('Cadastrar') && <Route path={`/companies/:companyId/students/create`} element={<Student />} />}

        <Route path={`/events`} element={<Events />} />
        <Route path={`/events/create`} element={<EventForm />} />
        <Route path={`/events/:eventId/view`} element={<EventView />} />
        <Route path={`/events/:eventId`} element={<EventForm />} />

        <Route path={`/instructors`} element={<Instructors />} />
        {hasPermission('Cadastrar') && <Route path={`/instructors/create`} element={<Instructor />} />}
        {hasPermission('Atualizar') && <Route path={`/instructors/:instructorId/view`} element={<InstructorView />} />}
        {hasPermission('Atualizar') && <Route path={`/instructors/:instructorId`} element={<Instructor />} />}

        <Route path={`/courses`} element={<Courses />} />
        {hasPermission('Cadastrar') && <Route path={`/courses/create`} element={<CourseV4 />} />}
        {hasPermission('Cadastrar') && <Route path={`/courses/create2`} element={<CourseV2 />} />}
        {hasPermission('Cadastrar') && <Route path={`/courses/create4`} element={<CourseV4 />} />}
        {hasPermission('Cadastrar') && <Route path={`/courses/cadastrar`} element={<CourseCadastrar />} />}
        {hasPermission('Atualizar') && <Route path={`/courses/:courseId/view`} element={<CourseView />} />}
        {hasPermission('Atualizar') && <Route path={`/courses/edit/:courseId`} element={<CourseEdit />} />}

        {hasPermission('Atualizar') && <Route path={`/courses/:courseId`} element={<CourseEdit />} />}

        <Route path={`/positions`} element={<Positions />} />
        {hasPermission('Cadastrar') && <Route path={`/positions/create`} element={<Position />} />}
        {hasPermission('Atualizar') && <Route path={`/positions/:positionId`} element={<Position />} />}

        <Route path={`/document-templates`} element={<DocumentTemplates />} />
        {hasPermission('Cadastrar') && <Route path={`/document-templates/create`} element={<DocumentTemplate />} />}
        {hasPermission('Atualizar') && <Route path={`/document-templates/:templateId`} element={<DocumentTemplate />} />}

        <Route path={`/notification-emails`} element={<NotificationTemplates />} />
        <Route path={`/notification-whatsapp`} element={<NotificationTemplates type={'whatsapp'} />} />

        <Route path={`/documents/:documentId/view`} element={<DocumentView />} />
        <Route path={`/documents`} element={<Documents />} />
        {hasPermission('Cadastrar') && <Route path={`/documents/create`} element={<DocumentGenerate />} />}

        <Route path="*" element={<Navigate to="/documents/create" />} />
        <Route path={`/notifications`} element={<Notifications />} />
      </Routes>
    </React.Suspense>
  );
}

export default Entity;
