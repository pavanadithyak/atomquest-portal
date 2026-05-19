# Testing Checklist — AtomQuest Portal

## Automated Test Results

### Backend (Jest)
```
Test Suites: 6 passed, 6 total
Tests:       24 passed, 24 total
Time:        11.828 s
```

| Suite | Tests | Status |
|-------|-------|--------|
| auth.test.js | 4 | PASS |
| goals.test.js | 4 | PASS |
| manager.test.js | 3 | PASS |
| achievements.test.js | 4 | PASS |
| check-ins.test.js | 3 | PASS |
| admin.test.js | 4 | PASS |

### Frontend (React Testing Library)
```
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Time:        15.529 s
```

| Suite | Tests | Status |
|-------|-------|--------|
| App.test.js | 1 | PASS |
| LoginPage.test.js | 1 | PASS |

---

## Manual Testing Checklist (~2 hours)

### 1. Setup & Health
- [ ] `docker compose up -d` starts all 3 containers without errors
- [ ] `GET /api/health` returns `{"status":"ok"}`
- [ ] Seed data: 10 users, 2 cycles, 6 goal sheets, 20 goals, 30 achievements present
- [ ] All containers show 0 exit codes in `docker compose ps`

### 2. Authentication
- [ ] Login as emp1@test.com redirects to /goals
- [ ] Login as mgr1@test.com redirects to /approvals
- [ ] Login as admin1@test.com redirects to /admin
- [ ] Invalid credentials show "Invalid credentials" error
- [ ] Register new user with valid data succeeds
- [ ] Register with duplicate email returns "Email already registered"
- [ ] Logout clears localStorage and redirects to /login
- [ ] Expired JWT (if manually tested) returns 401

### 3. Employee Goals
- [ ] Create goal sheet with 3 goals, weightages 40/30/30 — submits
- [ ] Weightage validation: total must equal 100%, each ≥10%
- [ ] Cannot submit with total ≠ 100% (submit button disabled)
- [ ] Add up to 8 goals per sheet
- [ ] Remove goals, minimum 1 required
- [ ] Edit draft goal sheet
- [ ] Submit draft for approval → status changes to "submitted"
- [ ] Delete draft goal sheet

### 4. Manager Approval
- [ ] Pending approvals list shows submitted sheets from direct reports
- [ ] Can expand/collapse goals within each sheet
- [ ] Approve sheet → status becomes "approved", sheet locks
- [ ] Reject sheet → status becomes "rejected", reason shown
- [ ] Cross-team restriction: manager cannot see other team's pending

### 5. Admin Shared Goals
- [ ] Admin pushes goal to multiple employees
- [ ] Recipient employees see shared goal in their goal sheet
- [ ] Shared goal has weightage 0% (doesn't affect 100% validation)

### 6. Achievements
- [ ] Employee logs achievement per goal per quarter
- [ ] Duplicate goal+quarter returns 409 conflict
- [ ] Achievement window validation (quarter must match cycle)
- [ ] Progress score auto-computed (numeric, percentage, timeline, zero-based)
- [ ] Admin can update achievement via PATCH

### 7. Manager Check-ins
- [ ] Manager creates check-in with employee, goal, quarter
- [ ] Manager comment, confidence level (low/medium/high), support needed
- [ ] Duplicate goal+manager+quarter returns 409
- [ ] Employee must have achievement before check-in (400 if not)

### 8. Admin Dashboard
- [ ] Phase goals metrics load (submitted, approved, pending)
- [ ] Quarterly achievement counts display
- [ ] Data matches seeded records

### 9. Audit Trail
- [ ] All admin actions logged (goal_unlocked, etc.)
- [ ] Date range filter works
- [ ] Action type filter works
- [ ] Table shows timestamp, user, action, entity, details

### 10. Reports
- [ ] CSV export downloads file with .csv extension
- [ ] CSV headers: Employee, Goal, Target, Actual, Progress%, Status
- [ ] JSON export returns full goal sheet data with nested goals and achievements
- [ ] Content-Type and Content-Disposition headers correct for CSV

### 11. RBAC Enforcement
- [ ] Employee cannot access /api/manager/* (403)
- [ ] Employee cannot access /api/admin/* (403)
- [ ] Manager cannot access /api/admin/* (403)
- [ ] Unauthenticated requests return 401

### 12. Edge Cases
- [ ] Empty form fields show validation messages
- [ ] Invalid email format rejected by browser
- [ ] Password < 8 chars rejected
- [ ] API returns appropriate HTTP status codes (400, 401, 403, 404, 409, 500)

### 13. UI/UX
- [ ] Responsive layout works on desktop (1920px) and tablet (768px)
- [ ] Loading states shown during API calls
- [ ] Error messages displayed inline on forms
- [ ] Success toasts/notifications after actions
- [ ] Navigation highlights active page

### 14. Performance
- [ ] Page loads complete in <2 seconds
- [ ] API responses under 200ms for typical queries
- [ ] No N+1 query patterns in Sequelize (verified via logging)

### 15. Security
- [ ] Password hashes not exposed in API responses (password_hash excluded)
- [ ] JWT secret not hardcoded (uses environment variable)
- [ ] CORS restricts to expected origins (or all in dev)
- [ ] Audit trail captures all admin state changes
- [ ] `.env` with secrets excluded from git (node_modules/, .env in .gitignore)

---

## Sign-off Criteria

- [ ] **0** critical or high bugs
- [ ] **Employee journey**: Create → Submit → Approve → Achievement → Check-in — works end-to-end
- [ ] **Manager journey**: View pending → Approve → Create check-in — works end-to-end
- [ ] **Admin journey**: Dashboard → Shared goals → Audit logs → Reports — works end-to-end
- [ ] README.md covers quick start, creds, features, tech stack, test results, folder structure
- [ ] TESTING.md covers all 15 categories
- [ ] No hardcoded secrets in source code
- [ ] Fresh `git clone` + `docker compose up` deploys successfully on clean machine
