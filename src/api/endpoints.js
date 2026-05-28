const DASHBOARD = '/api/dashboard';
const AUTH      = '/api/auth';

export const endpoints = {
  auth: {
    user:    `${AUTH}/user/`,
    login:   `${AUTH}/login/`,
    logout:  `${AUTH}/logout/`,
    refresh: `${AUTH}/token/refresh/`,
  },
  dashboard: {
    stats:        `${DASHBOARD}/stats/`,
    students:     `${DASHBOARD}/students/`,
    student:      (id) => `${DASHBOARD}/students/${id}/`,
    certificates: `${DASHBOARD}/certificates/`,
    certPending:  `${DASHBOARD}/certificates/pending/`,
    certApprove:  (id) => `${DASHBOARD}/certificates/${id}/approve/`,
    certReject:   (id) => `${DASHBOARD}/certificates/${id}/reject/`,
    jobPostings:  `${DASHBOARD}/job-postings/`,
    jobPosting:   (id) => `${DASHBOARD}/job-postings/${id}/`,
    jobReview:    (id) => `${DASHBOARD}/job-postings/${id}/review/`,
    jobSeekers:   `${DASHBOARD}/job-seekers/`,
    jobSeeker:    (id) => `${DASHBOARD}/job-seekers/${id}/`,
    jobApplications: `${DASHBOARD}/job-applications/`,
    jobForward:   (id) => `${DASHBOARD}/job-seekers/${id}/forward/`,
    messages:     `${DASHBOARD}/messages/`,
    messageBulk:  `${DASHBOARD}/messages/bulk/`,
    activity:     `${DASHBOARD}/activity/`,
    jobArchive: (id) => `${DASHBOARD}/job-postings/${id}/archive/`,
  },
};