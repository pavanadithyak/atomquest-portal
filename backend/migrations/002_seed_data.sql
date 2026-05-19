DO $$
DECLARE
  -- Users
  v_admin1 UUID; v_admin2 UUID;
  v_mgr1 UUID; v_mgr2 UUID; v_mgr3 UUID;
  v_emp1 UUID; v_emp2 UUID; v_emp3 UUID; v_emp4 UUID; v_emp5 UUID;
  -- Cycles
  v_phase1 UUID; v_q1 UUID;
  -- Goal sheets
  v_gs_emp1 UUID; v_gs_emp2 UUID; v_gs_emp3 UUID; v_gs_emp4 UUID; v_gs_emp5 UUID; v_gs_template UUID;
  -- Individual goals
  v_g1 UUID; v_g2 UUID; v_g3 UUID; v_g4 UUID; v_g5 UUID;
  v_g6 UUID; v_g7 UUID; v_g8 UUID; v_g9 UUID; v_g10 UUID;
  v_g11 UUID; v_g12 UUID; v_g13 UUID; v_g14 UUID; v_g15 UUID;
  -- Shared goals
  v_gs1 UUID; v_gs2 UUID; v_gs3 UUID; v_gs4 UUID; v_gs5 UUID;
  -- Achievement goal refs array
  v_goal_ids UUID[] := '{}';
  v_ach_goal UUID;
BEGIN

  -- ========== USERS ==========
  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'admin1@test.com', crypt('password123', gen_salt('bf')), 'Admin', 'One', 'admin', NULL, 'Admin')
  RETURNING id INTO v_admin1;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'admin2@test.com', crypt('password123', gen_salt('bf')), 'Admin', 'Two', 'admin', NULL, 'Admin')
  RETURNING id INTO v_admin2;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'manager1@test.com', crypt('password123', gen_salt('bf')), 'Manager', 'One', 'manager', v_admin1, 'Engineering')
  RETURNING id INTO v_mgr1;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'manager2@test.com', crypt('password123', gen_salt('bf')), 'Manager', 'Two', 'manager', v_admin1, 'Product')
  RETURNING id INTO v_mgr2;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'manager3@test.com', crypt('password123', gen_salt('bf')), 'Manager', 'Three', 'manager', v_admin2, 'Design')
  RETURNING id INTO v_mgr3;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'emp1@test.com', crypt('password123', gen_salt('bf')), 'Employee', 'One', 'employee', v_mgr1, 'Engineering')
  RETURNING id INTO v_emp1;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'emp2@test.com', crypt('password123', gen_salt('bf')), 'Employee', 'Two', 'employee', v_mgr1, 'QA')
  RETURNING id INTO v_emp2;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'emp3@test.com', crypt('password123', gen_salt('bf')), 'Employee', 'Three', 'employee', v_mgr2, 'Product')
  RETURNING id INTO v_emp3;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'emp4@test.com', crypt('password123', gen_salt('bf')), 'Employee', 'Four', 'employee', v_mgr2, 'Design')
  RETURNING id INTO v_emp4;

  INSERT INTO users (id, email, password_hash, first_name, last_name, role, manager_id, department)
  VALUES (gen_random_uuid(), 'emp5@test.com', crypt('password123', gen_salt('bf')), 'Employee', 'Five', 'employee', v_mgr3, 'Sales')
  RETURNING id INTO v_emp5;

  -- ========== CYCLES ==========
  INSERT INTO cycles (id, cycle_year, phase_name, window_open_date, window_close_date, created_by)
  VALUES (gen_random_uuid(), 2026, 'FY2026-Phase1', '2026-05-01', '2026-06-30', v_admin1)
  RETURNING id INTO v_phase1;

  INSERT INTO cycles (id, cycle_year, phase_name, window_open_date, window_close_date, created_by)
  VALUES (gen_random_uuid(), 2026, 'FY2026-Q1', '2026-05-01', '2026-12-31', v_admin1)
  RETURNING id INTO v_q1;

  -- ========== GOAL SHEETS ==========
  INSERT INTO goal_sheets (id, employee_id, cycle_id, status, total_weightage, is_locked)
  VALUES (gen_random_uuid(), v_emp1, v_q1, 'draft', 100, false)
  RETURNING id INTO v_gs_emp1;

  INSERT INTO goal_sheets (id, employee_id, cycle_id, status, total_weightage, is_locked)
  VALUES (gen_random_uuid(), v_emp2, v_q1, 'draft', 100, false)
  RETURNING id INTO v_gs_emp2;

  INSERT INTO goal_sheets (id, employee_id, cycle_id, status, total_weightage, is_locked)
  VALUES (gen_random_uuid(), v_emp3, v_q1, 'draft', 100, false)
  RETURNING id INTO v_gs_emp3;

  INSERT INTO goal_sheets (id, employee_id, cycle_id, status, total_weightage, is_locked)
  VALUES (gen_random_uuid(), v_emp4, v_q1, 'draft', 100, false)
  RETURNING id INTO v_gs_emp4;

  INSERT INTO goal_sheets (id, employee_id, cycle_id, status, total_weightage, is_locked)
  VALUES (gen_random_uuid(), v_emp5, v_q1, 'draft', 100, false)
  RETURNING id INTO v_gs_emp5;

  INSERT INTO goal_sheets (id, employee_id, cycle_id, status, total_weightage, is_locked)
  VALUES (gen_random_uuid(), v_admin1, v_q1, 'approved', 100, true)
  RETURNING id INTO v_gs_template;

  -- ========== INDIVIDUAL GOALS (3 per employee, weights 40/35/25) ==========

  -- Employee 1
  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp1, 'Customer Experience', 'Improve CSAT Score to 4.5',
    'Increase customer satisfaction score from current 4.1 to 4.5 by end of quarter through proactive support and faster resolution times.',
    'score', 4.5, 40)
  RETURNING id INTO v_g1;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp1, 'Engineering Excellence', 'Reduce P99 latency to <200ms',
    'Optimize API response times to ensure 99th percentile latency stays under 200 milliseconds.',
    'ms', 200, 35)
  RETURNING id INTO v_g2;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp1, 'Product Quality', 'Achieve 99.9% Uptime',
    'Maintain system availability at 99.9% or higher for all production services.',
    'percentage', 99.9, 25)
  RETURNING id INTO v_g3;

  -- Employee 2
  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp2, 'Customer Experience', 'Reduce Avg Response Time to <2hr',
    'Decrease average first-response time for customer tickets from 4 hours to under 2 hours.',
    'hours', 2, 40)
  RETURNING id INTO v_g4;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp2, 'Operational Efficiency', 'Automate 5 Manual Workflows',
    'Identify and automate 5 recurring manual workflows to reduce operational overhead.',
    'numeric', 5, 35)
  RETURNING id INTO v_g5;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp2, 'Innovation', 'Submit 3 Process Improvement Ideas',
    'Research and submit at least 3 process improvement ideas with measurable impact analysis.',
    'numeric', 3, 25)
  RETURNING id INTO v_g6;

  -- Employee 3
  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp3, 'Product Quality', 'Reduce Bug Escape Rate to <5%',
    'Lower the percentage of bugs that escape to production to less than 5% of all bugs found.',
    'percentage', 5, 40)
  RETURNING id INTO v_g7;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp3, 'Customer Experience', 'Achieve NPS Score >60',
    'Drive Net Promoter Score above 60 by improving product usability and gathering user feedback.',
    'score', 60, 35)
  RETURNING id INTO v_g8;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp3, 'Engineering Excellence', 'Complete 4 Tech Debt Stories',
    'Dedicate capacity to complete 4 technical debt reduction stories from the backlog.',
    'numeric', 4, 25)
  RETURNING id INTO v_g9;

  -- Employee 4
  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp4, 'Operational Efficiency', 'Reduce Deployment Time by 40%',
    'Streamline CI/CD pipeline to cut average deployment time from 2 hours to ~72 minutes.',
    'percentage', 40, 40)
  RETURNING id INTO v_g10;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp4, 'Innovation', 'Implement 2 Feature Experiments',
    'Design and run 2 A/B experiments on new features to validate product hypotheses.',
    'numeric', 2, 35)
  RETURNING id INTO v_g11;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp4, 'Product Quality', 'Achieve 90% Code Coverage',
    'Increase unit test coverage across all services to at least 90%.',
    'percentage', 90, 25)
  RETURNING id INTO v_g12;

  -- Employee 5
  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp5, 'Engineering Excellence', 'Migrate 3 Legacy Services',
    'Plan and execute migration of 3 legacy services to the new platform architecture.',
    'numeric', 3, 40)
  RETURNING id INTO v_g13;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp5, 'Customer Experience', 'Reduce Churn Rate to <3%',
    'Implement retention initiatives to bring monthly customer churn rate below 3%.',
    'percentage', 3, 35)
  RETURNING id INTO v_g14;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage)
  VALUES (gen_random_uuid(), v_gs_emp5, 'Operational Efficiency', 'Document 10 Runbooks',
    'Create and maintain 10 operational runbooks for critical system procedures.',
    'numeric', 10, 25)
  RETURNING id INTO v_g15;

  -- ========== SHARED GOALS (5 templates, 20% each) ==========
  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage, is_shared)
  VALUES (gen_random_uuid(), v_gs_template, 'Employee Wellness', 'Wellness Program Participation',
    'Achieve 80% participation in wellness programs across the organization.',
    'percentage', 80, 20, true)
  RETURNING id INTO v_gs1;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage, is_shared)
  VALUES (gen_random_uuid(), v_gs_template, 'Cross-team Collaboration', 'Cross-functional Projects',
    'Lead or participate in 2 cross-team initiatives this quarter.',
    'numeric', 2, 20, true)
  RETURNING id INTO v_gs2;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage, is_shared)
  VALUES (gen_random_uuid(), v_gs_template, 'Knowledge Sharing', 'Internal Knowledge Base Contributions',
    'Contribute 5 articles to the internal knowledge base or wiki.',
    'numeric', 5, 20, true)
  RETURNING id INTO v_gs3;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage, is_shared)
  VALUES (gen_random_uuid(), v_gs_template, 'Mentorship Program', 'Mentorship Hours',
    'Mentor junior team members for at least 10 hours per quarter.',
    'numeric', 10, 20, true)
  RETURNING id INTO v_gs4;

  INSERT INTO goals (id, goal_sheet_id, thrust_area, title, description, uom_type, target_value, weightage, is_shared)
  VALUES (gen_random_uuid(), v_gs_template, 'Innovation Lab', 'Innovation Proposals',
    'Submit 2 innovation proposals with potential business impact.',
    'numeric', 2, 20, true)
  RETURNING id INTO v_gs5;

  -- ========== ACHIEVEMENTS (2 per individual goal = 30) ==========

  -- Helper: collect individual goal IDs into array
  v_goal_ids := ARRAY[v_g1, v_g2, v_g3, v_g4, v_g5, v_g6, v_g7, v_g8, v_g9, v_g10, v_g11, v_g12, v_g13, v_g14, v_g15];

  -- Achievement templates: (goal_idx, actual_value1, progress1, status1, comment1, actual_value2, progress2, status2, comment2)
  -- varied actual_values (20-95% of target), progress_scores (0.3-0.9), statuses mixed

  -- v_g1 (emp1, CSAT 4.5): first mid-quarter check, second end-of-quarter
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g1, v_emp1, 'Q1', 3.8, 'on_track', 'CSAT improved from 4.1 to 4.2, need to focus on ticket resolution speed.', 0.55);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g1, v_emp1, 'Q1', 4.3, 'on_track', 'Continued improvement, implemented auto-responses. On track to hit 4.5.', 0.80);

  -- v_g2 (emp1, P99 latency 200ms)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g2, v_emp1, 'Q1', 310, 'at_risk', 'Latency spiked due to increased traffic. Optimizing database queries.', 0.35);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g2, v_emp1, 'Q1', 245, 'on_track', 'Query optimization helped. Added caching layer, now trending toward target.', 0.65);

  -- v_g3 (emp1, uptime 99.9%)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g3, v_emp1, 'Q1', 99.85, 'on_track', 'Minor incident caused 0.05% dip, resolved within SLA.', 0.60);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g3, v_emp1, 'Q1', 99.92, 'completed', 'Implemented redundant failover. Uptime now exceeds target.', 0.95);

  -- v_g4 (emp2, response time 2hr)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g4, v_emp2, 'Q1', 3.5, 'on_track', 'Reduced from 4hr to 3.5hr. Need to optimize shift handoffs.', 0.40);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g4, v_emp2, 'Q1', 2.2, 'on_track', 'New triage system helped. Close to target, need final push.', 0.85);

  -- v_g5 (emp2, automate 5 workflows)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g5, v_emp2, 'Q1', 2, 'on_track', 'Automated 2 workflows: ticket assignment and report generation.', 0.45);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g5, v_emp2, 'Q1', 4, 'on_track', 'Completed 4 of 5. Working on the deployment pipeline automation.', 0.80);

  -- v_g6 (emp2, 3 improvement ideas)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g6, v_emp2, 'Q1', 1, 'pending', 'Submitted first idea for review. Gathering data for second.', 0.30);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g6, v_emp2, 'Q1', 3, 'completed', 'Submitted all 3 ideas. Two accepted for pilot implementation.', 0.90);

  -- v_g7 (emp3, bug escape <5%)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g7, v_emp3, 'Q1', 7, 'on_track', 'Escape rate at 7%. Added automated regression tests.', 0.50);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g7, v_emp3, 'Q1', 4, 'completed', 'Enhanced QA pipeline. Escape rate dropped to 4%, below target.', 0.92);

  -- v_g8 (emp3, NPS >60)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g8, v_emp3, 'Q1', 48, 'at_risk', 'NPS at 48, below trajectory. Need to address UX friction points.', 0.35);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g8, v_emp3, 'Q1', 55, 'on_track', 'UX improvements shipped. NPS climbing, but still short of 60 target.', 0.70);

  -- v_g9 (emp3, 4 tech debt stories)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g9, v_emp3, 'Q1', 1, 'on_track', 'Completed 1 story. Refactored authentication module.', 0.25);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g9, v_emp3, 'Q1', 3, 'on_track', '3 stories done. One remaining - DB migration story in progress.', 0.75);

  -- v_g10 (emp4, deploy time -40%)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g10, v_emp4, 'Q1', 15, 'on_track', 'Reduced deployment time by 15%. Parallelized test execution.', 0.45);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g10, v_emp4, 'Q1', 35, 'completed', 'Achieved 35% reduction. Optimized build pipeline and added caching.', 0.88);

  -- v_g11 (emp4, 2 feature experiments)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g11, v_emp4, 'Q1', 0, 'at_risk', 'Design phase taking longer than expected. First experiment ready next week.', 0.15);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g11, v_emp4, 'Q1', 1, 'on_track', 'First experiment launched. Results promising. Second experiment in design.', 0.55);

  -- v_g12 (emp4, 90% coverage)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g12, v_emp4, 'Q1', 72, 'on_track', 'Coverage at 72%, up from 65%. Focused on module A and B unit tests.', 0.50);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g12, v_emp4, 'Q1', 85, 'on_track', '85% coverage. Integration tests added. On track for 90% by end of quarter.', 0.78);

  -- v_g13 (emp5, migrate 3 services)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g13, v_emp5, 'Q1', 1, 'on_track', 'Migrated notification service. First service completed successfully.', 0.40);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g13, v_emp5, 'Q1', 2, 'on_track', 'Auth service migration in progress. Second service partially complete.', 0.65);

  -- v_g14 (emp5, churn <3%)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g14, v_emp5, 'Q1', 4.2, 'at_risk', 'Churn at 4.2%. Need to launch retention campaign urgently.', 0.30);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g14, v_emp5, 'Q1', 3.5, 'on_track', 'Retention campaign launched. Churn trending down.', 0.60);

  -- v_g15 (emp5, 10 runbooks)
  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g15, v_emp5, 'Q1', 3, 'on_track', 'Created 3 runbooks: deployment, rollback, and incident response.', 0.35);

  INSERT INTO achievements (goal_id, employee_id, quarter, actual_value, status, employee_comments, progress_score)
  VALUES (v_g15, v_emp5, 'Q1', 7, 'on_track', '7 runbooks complete. Working on monitoring and backup runbooks.', 0.70);

END $$;
