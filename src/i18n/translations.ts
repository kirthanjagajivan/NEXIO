export type Language = 'en' | 'de' | 'tr' | 'ar' | 'ru';

export interface Translation {
  greeting: string;
  tagline: string;
  selectLanguage: string;
  languageNames: Record<Language, string>;
  selectRole: string;
  trainee: string;
  teacher: string;
  traineeDesc: string;
  teacherDesc: string;
  lessons: string;
  performance: string;
  profile: string;
  home: string;
  noLessons: string;
  noPerformanceData: string;
  profileName: string;
  profileEmail: string;
  profileLevel: string;
  signOut: string;
  back: string;
  startTest: string;
  chapter: string;
  testTitle: string;
  totalMarks: string;
  sectionMCQ: string;
  sectionShortAnswer: string;
  sectionFillBlanks: string;
  submitTest: string;
  marks: string;
  yourAnswer: string;
  selectAnswer: string;
  testSubmitted: string;
  score: string;
  backToLesson: string;
  congratulations: string;
  youPassed: string;
  needImprovement: string;
  repeatLesson: string;
  nextTopic: string;
  allTopicsComplete: string;

  dashboard: string;
  daily_goal: string;
  progress: string;
  recommended: string;
  overall_progress: string;
  course_completion: string;
  ai_recommendation: string;
  ai_suggests_review: string;
  ai_review_reason: string;
  review_lesson: string;
  recommended_next: string;
  start_lesson: string;
  competency_areas: string;
  needs_work: string;
  strong: string;
  not_started: string;
  weak_areas: string;
  achievement_badges: string;
  browse_all_lessons: string;
  welcome_back: string;
  start_first_lesson: string;
  lessons_passed: string;
  xp: string;
  avg: string;
  passed_label: string;
  goal_complete: string;
  lessons_today: string;
  all_lessons_done_today: string;
  done: string;
  remaining: string;
  topics_passed: string;
  lessons_completed_xp: string;

  performance_overview: string;
  lessons_tracked: string;
  clear_history: string;
  lessons_tracked_label: string;
  passed_stat: string;
  avg_score: string;
  total_attempts: string;
  across_all_lessons: string;
  lesson_results: string;
  pass_fail_summary: string;
  all_lessons_done: string;
  lessons_completed_of: string;
  course_completion_label: string;
  pass_rate: string;
  attempts_label: string;
  pass_badge: string;
  fail_badge: string;
  failed_label: string;
  complete_lesson_prompt: string;
  you_are_improving: string;
  you_are_improving_desc: string;
  excellent_performance: string;
  excellent_performance_desc: string;
  needs_more_practice: string;
  needs_more_practice_desc: string;
  steady_progress: string;
  steady_progress_desc: string;

  loading_lessons: string;
  no_lessons_yet: string;
  weak_label: string;
  no_topics_in_chapter: string;
  weak_area_score: string;
  passed_score: string;

  no_content_available: string;
  no_content_available_desc: string;
  back_to_lesson: string;
  generating_test: string;
  generating_test_desc: string;
  new_questions: string;
  regenerate_questions: string;
  evaluating_answers: string;
  sections_questions_marks: string;
  questions_marks_each: string;
  percentage: string;
  grade: string;
  pass_threshold: string;
  mcq_section_label: string;
  fill_blank_section_label: string;
  review_suffix: string;
  no_answer_selected: string;
  correct_marks: string;
  not_answered: string;
  incorrect_marks: string;
  correct_answer_prefix: string;
  blank_placeholder: string;
  correct_answer_label: string;

  admin_dashboard: string;
  teacher_portal: string;
  refresh_data: string;
  chapters_stat: string;
  topics_stat: string;
  with_content_stat: string;
  navigation: string;
  manage_chapters: string;
  manage_chapters_desc: string;
  manage_topics: string;
  manage_topics_desc: string;
  upload_content: string;
  upload_content_desc: string;
  sign_out: string;

  chapters_heading: string;
  add_chapter: string;
  no_chapters_yet: string;
  no_chapters_desc: string;
  click_to_rename: string;
  delete_chapter: string;
  delete_chapter_confirm: string;
  topics_count: string;

  topics_heading: string;
  no_chapters_for_topics: string;
  no_chapters_for_topics_desc: string;
  add_topic: string;
  no_topics_in_chapter_admin: string;
  add_first_topic: string;
  has_content: string;
  no_content: string;
  delete_topic: string;
  delete_topic_confirm: string;

  upload_content_heading: string;
  upload_content_sub: string;
  no_chapters_or_topics: string;
  no_chapters_or_topics_desc: string;
  select_topic: string;
  content_language: string;
  select_topic_to_edit: string;
  edit_tab: string;
  preview_tab: string;
  upload_txt: string;
  content_preview: string;
  no_content_to_preview: string;
  lesson_content_label: string;
  clear_content: string;
  paste_content_placeholder: string;
  content_tip: string;
  content_uploaded_badge: string;
  no_content_badge: string;
  saving: string;
  saved_successfully: string;
  save_content: string;

  cancel: string;
  delete_confirm: string;

  no_content_in_lang: string;
  available_in: string;

  badge_first_lesson: string;
  badge_first_lesson_desc: string;
  badge_on_fire: string;
  badge_on_fire_desc: string;
  badge_champion: string;
  badge_champion_desc: string;
  badge_high_scorer: string;
  badge_high_scorer_desc: string;
  badge_persistent: string;
  badge_persistent_desc: string;
  badge_rocket: string;
  badge_rocket_desc: string;

  // Auth
  login: string;
  register: string;
  email: string;
  password: string;
  full_name: string;
  native_language: string;
  german_proficiency: string;
  app_language: string;
  role_label: string;
  role_trainee: string;
  role_teacher: string;
  role_trainer: string;
  proficiency_beginner: string;
  proficiency_intermediate: string;
  proficiency_advanced: string;
  proficiency_native: string;
  no_account: string;
  has_account: string;
  login_button: string;
  register_button: string;
  logging_in: string;
  registering: string;
  invalid_credentials: string;
  email_in_use: string;
  weak_password: string;
  required_field: string;
  trainer: string;
  trainer_desc: string;
  welcome_title: string;
  welcome_subtitle: string;

  of: string;

  // Trainer dashboard
  practical_tasks: string;
  assigned_trainees: string;
  performance: string;
  feedback: string;
  create_task: string;
  task_title: string;
  task_description: string;
  task_instructions: string;
  difficulty_level: string;
  estimated_duration: string;
  minutes: string;
  edit_task: string;
  delete_task: string;
  no_tasks: string;
  trainee_list: string;
  assign_trainee: string;
  unassign_trainee: string;
  assigned_count: string;
  progress: string;
  avg_score: string;
  lessons_completed: string;
  add_feedback: string;
  feedback_text: string;
  rating: string;
  topic: string;
  no_feedback: string;
  view_submissions: string;
  submit_task: string;
  submission_status: string;
  pending: string;
  submitted: string;
  reviewed: string;
  beginner: string;
  intermediate: string;
  advanced: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    greeting: 'Welcome',
    tagline: 'Start prompting (or editing) to see magic happen',
    selectLanguage: 'Select Language',
    selectRole: 'Select Your Role',
    trainee: 'Trainee',
    teacher: 'Teacher',
    traineeDesc: 'Access lessons, take tests, track your performance and manage your profile',
    teacherDesc: 'Manage chapters, topics, and upload lesson content for trainees',
    lessons: 'Lessons',
    performance: 'Performance',
    profile: 'Profile',
    home: 'Home',
    noLessons: 'No lessons available yet',
    noPerformanceData: 'No performance data available',
    profileName: 'Name',
    profileEmail: 'Email',
    profileLevel: 'Level',
    signOut: 'Sign Out',
    back: 'Back',
    startTest: 'Start Test',
    chapter: 'Chapter',
    testTitle: 'Knowledge Test',
    totalMarks: 'Total Marks',
    sectionMCQ: 'Section 1: Multiple Choice Questions',
    sectionShortAnswer: 'Section 2: Short Answer Questions',
    sectionFillBlanks: 'Section 3: Fill in the Blanks',
    submitTest: 'Submit Test',
    marks: 'marks',
    yourAnswer: 'Your answer...',
    selectAnswer: 'Select an answer',
    testSubmitted: 'Test Submitted!',
    score: 'Your Score',
    backToLesson: 'Back to Lesson',
    congratulations: 'Congratulations, you passed!',
    youPassed: 'You have successfully completed this topic. You can now proceed to the next one.',
    needImprovement: 'You need to improve.',
    repeatLesson: 'Repeat the Lesson',
    nextTopic: 'Next Topic',
    allTopicsComplete: 'All topics completed!',
    languageNames: {
      en: 'English',
      de: 'German',
      tr: 'Turkish',
      ar: 'Arabic',
      ru: 'Russian',
    },

    dashboard: 'Dashboard',
    daily_goal: 'Daily Goal',
    progress: 'Progress',
    recommended: 'Recommended',
    overall_progress: 'Overall Progress',
    course_completion: 'Course completion',
    ai_recommendation: 'AI Recommendation',
    ai_suggests_review: 'AI suggests reviewing this lesson',
    ai_review_reason: 'Your score was below 60% — a review will strengthen this topic.',
    review_lesson: 'Review Lesson',
    recommended_next: 'Recommended Next',
    start_lesson: 'Start Lesson',
    competency_areas: 'Competency Areas',
    needs_work: 'Needs work',
    strong: 'Strong',
    not_started: 'Not started',
    weak_areas: 'Weak Areas — Review Needed',
    achievement_badges: 'Achievement Badges',
    browse_all_lessons: 'Browse All Lessons',
    welcome_back: 'Welcome back',
    start_first_lesson: 'Start your first lesson today!',
    lessons_passed: 'lessons passed',
    xp: 'XP',
    avg: '% avg',
    passed_label: 'passed',
    goal_complete: 'Goal complete!',
    lessons_today: 'lessons today',
    all_lessons_done_today: 'lessons done for today',
    done: 'done',
    remaining: 'remaining',
    topics_passed: 'topics passed',
    lessons_completed_xp: 'lessons completed',

    performance_overview: 'Performance Overview',
    lessons_tracked: 'lessons tracked',
    clear_history: 'Clear history',
    lessons_tracked_label: 'Lessons Tracked',
    passed_stat: 'Passed',
    avg_score: 'Avg Score',
    total_attempts: 'Total Attempts',
    across_all_lessons: 'across all lessons',
    lesson_results: 'Lesson Results',
    pass_fail_summary: 'Pass / Fail Summary',
    all_lessons_done: 'All lessons done!',
    lessons_completed_of: 'lessons completed',
    course_completion_label: 'Course Completion',
    pass_rate: '% pass rate',
    attempts_label: 'Attempts:',
    pass_badge: 'PASS',
    fail_badge: 'FAIL',
    failed_label: 'failed',
    complete_lesson_prompt: 'Complete a lesson test to see your results here.',
    you_are_improving: 'You are improving',
    you_are_improving_desc: 'Your recent scores are trending upward. Keep up the great momentum!',
    excellent_performance: 'Excellent performance',
    excellent_performance_desc: 'Consistently high scores across all lessons. Outstanding work!',
    needs_more_practice: 'Needs more practice',
    needs_more_practice_desc: 'Your scores suggest revisiting the lesson content before retrying.',
    steady_progress: 'Steady progress',
    steady_progress_desc: 'You are making solid progress. Try to push for higher scores on each lesson.',

    loading_lessons: 'Loading lessons...',
    no_lessons_yet: 'No lessons available yet.',
    weak_label: 'weak',
    no_topics_in_chapter: 'No topics in this chapter.',
    weak_area_score: 'Weak area — score',
    passed_score: 'Passed —',

    no_content_available: 'No lesson content available',
    no_content_available_desc: "The teacher hasn't uploaded content for this topic yet. Check back later or contact your instructor.",
    back_to_lesson: 'Back to lesson',
    generating_test: 'Generating your test...',
    generating_test_desc: 'Creating unique questions from the lesson content',
    new_questions: 'New Questions',
    regenerate_questions: 'Regenerate questions',
    evaluating_answers: 'Evaluating answers...',
    sections_questions_marks: '2 sections · 10 questions · 50 marks',
    questions_marks_each: 'questions · marks each',
    percentage: 'Percentage',
    grade: 'Grade',
    pass_threshold: 'Pass',
    mcq_section_label: 'MCQ (Section 1)',
    fill_blank_section_label: 'Fill in Blanks (Section 2)',
    review_suffix: '— Review',
    no_answer_selected: 'No answer selected',
    correct_marks: 'Correct —',
    not_answered: 'Not answered — 0 marks',
    incorrect_marks: 'Incorrect — 0 marks',
    correct_answer_prefix: 'Correct:',
    blank_placeholder: 'blank',
    correct_answer_label: 'Correct answer:',

    admin_dashboard: 'Admin Dashboard',
    teacher_portal: 'Teacher Portal',
    refresh_data: 'Refresh data',
    chapters_stat: 'Chapters',
    topics_stat: 'Topics',
    with_content_stat: 'With Content',
    navigation: 'Navigation',
    manage_chapters: 'Manage Chapters',
    manage_chapters_desc: 'Create and organize lesson chapters',
    manage_topics: 'Manage Topics',
    manage_topics_desc: 'Add topics within chapters',
    upload_content: 'Upload Content',
    upload_content_desc: 'Write or upload lesson content',
    sign_out: 'Sign Out',

    chapters_heading: 'Chapters',
    add_chapter: 'Add Chapter',
    no_chapters_yet: 'No chapters yet',
    no_chapters_desc: 'Click "+ Add Chapter" to create your first chapter',
    click_to_rename: 'click to rename',
    delete_chapter: 'Delete Chapter',
    delete_chapter_confirm: 'Are you sure you want to delete this chapter? All topics and content inside will be permanently removed.',
    topics_count: 'topics',

    topics_heading: 'Topics',
    no_chapters_for_topics: 'No chapters yet',
    no_chapters_for_topics_desc: 'Create chapters first before adding topics',
    add_topic: 'Add topic',
    no_topics_in_chapter_admin: 'No topics in this chapter yet',
    add_first_topic: 'Add First Topic',
    has_content: 'Has content',
    no_content: 'No content',
    delete_topic: 'Delete Topic',
    delete_topic_confirm: 'Are you sure you want to delete this topic? Any uploaded content for this topic will also be removed.',

    upload_content_heading: 'Upload Content',
    upload_content_sub: 'Select a topic and language, then paste or upload the lesson content',
    no_chapters_or_topics: 'No chapters or topics yet',
    no_chapters_or_topics_desc: 'Create chapters and topics first before uploading content',
    select_topic: 'Select Topic',
    content_language: 'Content Language',
    select_topic_to_edit: 'Select a topic to start editing content',
    edit_tab: 'Edit',
    preview_tab: 'Preview',
    upload_txt: 'Upload .txt',
    content_preview: 'Content Preview',
    no_content_to_preview: 'No content to preview',
    lesson_content_label: 'Lesson Content',
    clear_content: 'Clear',
    paste_content_placeholder: 'Paste or type your lesson content here...',
    content_tip: 'Tip: More content generates better quiz questions',
    content_uploaded_badge: 'Content uploaded',
    no_content_badge: 'No content yet',
    saving: 'Saving...',
    saved_successfully: 'Saved successfully',
    save_content: 'Save Content',

    cancel: 'Cancel',
    delete_confirm: 'Delete',

    no_content_in_lang: 'No content available in',
    available_in: 'Available in:',

    badge_first_lesson: 'First Lesson',
    badge_first_lesson_desc: 'Completed your first test',
    badge_on_fire: 'On Fire',
    badge_on_fire_desc: 'Passed 3 lessons',
    badge_champion: 'Champion',
    badge_champion_desc: 'Passed all lessons',
    badge_high_scorer: 'High Scorer',
    badge_high_scorer_desc: 'Scored 80%+ on a lesson',
    badge_persistent: 'Persistent',
    badge_persistent_desc: 'Attempted a lesson 3+ times',
    badge_rocket: 'Rocket Start',
    badge_rocket_desc: 'Scored 90%+ on your first try',

    login: 'Log In',
    register: 'Create Account',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    native_language: 'Native Language',
    german_proficiency: 'German Proficiency',
    app_language: 'App Language',
    role_label: 'Role',
    role_trainee: 'Trainee',
    role_teacher: 'Teacher',
    role_trainer: 'Trainer',
    proficiency_beginner: 'Beginner',
    proficiency_intermediate: 'Intermediate',
    proficiency_advanced: 'Advanced',
    proficiency_native: 'Native Speaker',
    no_account: "Don't have an account?",
    has_account: 'Already have an account?',
    login_button: 'Log In',
    register_button: 'Create Account',
    logging_in: 'Logging in...',
    registering: 'Creating account...',
    invalid_credentials: 'Invalid email or password',
    email_in_use: 'An account with this email already exists',
    weak_password: 'Password must be at least 6 characters',
    required_field: 'This field is required',
    trainer: 'Trainer',
    trainer_desc: 'Oversee training programs and monitor trainee progress',
    welcome_title: 'Welcome to the Learning Platform',
    welcome_subtitle: 'Sign in to continue or create a new account',

    of: 'of',

    practical_tasks: 'Practical Tasks',
    assigned_trainees: 'Assigned Trainees',
    performance: 'Performance',
    feedback: 'Feedback',
    create_task: 'Create Task',
    task_title: 'Task Title',
    task_description: 'Description',
    task_instructions: 'Instructions',
    difficulty_level: 'Difficulty Level',
    estimated_duration: 'Estimated Duration',
    minutes: 'minutes',
    edit_task: 'Edit',
    delete_task: 'Delete',
    no_tasks: 'No tasks yet',
    trainee_list: 'Trainee List',
    assign_trainee: 'Assign Trainee',
    unassign_trainee: 'Unassign',
    assigned_count: 'Assigned',
    progress: 'Progress',
    avg_score: 'Avg Score',
    lessons_completed: 'Lessons Completed',
    add_feedback: 'Add Feedback',
    feedback_text: 'Feedback',
    rating: 'Rating',
    topic: 'Topic',
    no_feedback: 'No feedback yet',
    view_submissions: 'View Submissions',
    submit_task: 'Submit Task',
    submission_status: 'Status',
    pending: 'Pending',
    submitted: 'Submitted',
    reviewed: 'Reviewed',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },

  de: {
    greeting: 'Willkommen',
    tagline: 'Beginne mit der Eingabe (oder Bearbeitung), um Magie zu erleben',
    selectLanguage: 'Sprache auswählen',
    selectRole: 'Wählen Sie Ihre Rolle',
    trainee: 'Anfänger',
    teacher: 'Lehrer',
    traineeDesc: 'Lektionen abrufen, Tests absolvieren, Leistung verfolgen und Profil verwalten',
    teacherDesc: 'Kapitel und Themen verwalten sowie Lektionsinhalte für Teilnehmer hochladen',
    lessons: 'Lektionen',
    performance: 'Leistung',
    profile: 'Profil',
    home: 'Startseite',
    noLessons: 'Noch keine Lektionen verfügbar',
    noPerformanceData: 'Keine Leistungsdaten verfügbar',
    profileName: 'Name',
    profileEmail: 'E-Mail',
    profileLevel: 'Niveau',
    signOut: 'Abmelden',
    back: 'Zurück',
    startTest: 'Test starten',
    chapter: 'Kapitel',
    testTitle: 'Wissenstest',
    totalMarks: 'Gesamtpunktzahl',
    sectionMCQ: 'Abschnitt 1: Multiple-Choice-Fragen',
    sectionShortAnswer: 'Abschnitt 2: Kurzantwortfragen',
    sectionFillBlanks: 'Abschnitt 3: Lückentext',
    submitTest: 'Test einreichen',
    marks: 'Punkte',
    yourAnswer: 'Ihre Antwort...',
    selectAnswer: 'Antwort auswählen',
    testSubmitted: 'Test eingereicht!',
    score: 'Ihre Punktzahl',
    backToLesson: 'Zurück zur Lektion',
    congratulations: 'Herzlichen Glückwunsch, Sie haben bestanden!',
    youPassed: 'Sie haben dieses Thema erfolgreich abgeschlossen. Sie können jetzt zum nächsten übergehen.',
    needImprovement: 'Sie müssen sich verbessern.',
    repeatLesson: 'Lektion wiederholen',
    nextTopic: 'Nächstes Thema',
    allTopicsComplete: 'Alle Themen abgeschlossen!',
    languageNames: {
      en: 'Englisch',
      de: 'Deutsch',
      tr: 'Türkisch',
      ar: 'Arabisch',
      ru: 'Russisch',
    },

    dashboard: 'Dashboard',
    daily_goal: 'Tagesziel',
    progress: 'Fortschritt',
    recommended: 'Empfohlen',
    overall_progress: 'Gesamtfortschritt',
    course_completion: 'Kursabschluss',
    ai_recommendation: 'KI-Empfehlung',
    ai_suggests_review: 'KI empfiehlt die Wiederholung dieser Lektion',
    ai_review_reason: 'Ihre Punktzahl lag unter 60 % — eine Wiederholung stärkt dieses Thema.',
    review_lesson: 'Lektion wiederholen',
    recommended_next: 'Als nächstes empfohlen',
    start_lesson: 'Lektion starten',
    competency_areas: 'Kompetenzbereiche',
    needs_work: 'Verbesserungsbedarf',
    strong: 'Stark',
    not_started: 'Nicht begonnen',
    weak_areas: 'Schwache Bereiche — Wiederholung erforderlich',
    achievement_badges: 'Abzeichen',
    browse_all_lessons: 'Alle Lektionen anzeigen',
    welcome_back: 'Willkommen zurück',
    start_first_lesson: 'Starten Sie heute Ihre erste Lektion!',
    lessons_passed: 'Lektionen bestanden',
    xp: 'XP',
    avg: '% Durchschnitt',
    passed_label: 'bestanden',
    goal_complete: 'Ziel erreicht!',
    lessons_today: 'Lektionen heute',
    all_lessons_done_today: 'Lektionen für heute abgeschlossen',
    done: 'erledigt',
    remaining: 'verbleibend',
    topics_passed: 'Themen bestanden',
    lessons_completed_xp: 'Lektionen abgeschlossen',

    performance_overview: 'Leistungsübersicht',
    lessons_tracked: 'Lektionen verfolgt',
    clear_history: 'Verlauf löschen',
    lessons_tracked_label: 'Verfolgte Lektionen',
    passed_stat: 'Bestanden',
    avg_score: 'Durchschnittspunktzahl',
    total_attempts: 'Gesamtversuche',
    across_all_lessons: 'über alle Lektionen',
    lesson_results: 'Lektionsergebnisse',
    pass_fail_summary: 'Bestanden / Nicht bestanden',
    all_lessons_done: 'Alle Lektionen abgeschlossen!',
    lessons_completed_of: 'Lektionen abgeschlossen',
    course_completion_label: 'Kursabschluss',
    pass_rate: '% Bestehensquote',
    attempts_label: 'Versuche:',
    pass_badge: 'BESTANDEN',
    fail_badge: 'NICHT BESTANDEN',
    failed_label: 'nicht bestanden',
    complete_lesson_prompt: 'Schließen Sie einen Lektionstest ab, um Ihre Ergebnisse hier zu sehen.',
    you_are_improving: 'Sie verbessern sich',
    you_are_improving_desc: 'Ihre letzten Ergebnisse sind im Aufwärtstrend. Weiter so!',
    excellent_performance: 'Hervorragende Leistung',
    excellent_performance_desc: 'Durchgehend hohe Punktzahlen in allen Lektionen. Ausgezeichnete Arbeit!',
    needs_more_practice: 'Mehr Übung erforderlich',
    needs_more_practice_desc: 'Ihre Ergebnisse deuten darauf hin, dass Sie den Lektionsinhalt vor einem erneuten Versuch überarbeiten sollten.',
    steady_progress: 'Stetiger Fortschritt',
    steady_progress_desc: 'Sie machen solide Fortschritte. Versuchen Sie, bei jeder Lektion höhere Punktzahlen zu erzielen.',

    loading_lessons: 'Lektionen werden geladen...',
    no_lessons_yet: 'Noch keine Lektionen verfügbar.',
    weak_label: 'schwach',
    no_topics_in_chapter: 'Keine Themen in diesem Kapitel.',
    weak_area_score: 'Schwacher Bereich — Punktzahl',
    passed_score: 'Bestanden —',

    no_content_available: 'Kein Lektionsinhalt verfügbar',
    no_content_available_desc: 'Der Lehrer hat noch keinen Inhalt für dieses Thema hochgeladen. Schauen Sie später nach oder wenden Sie sich an Ihren Ausbilder.',
    back_to_lesson: 'Zurück zur Lektion',
    generating_test: 'Test wird erstellt...',
    generating_test_desc: 'Einzigartige Fragen aus dem Lektionsinhalt werden generiert',
    new_questions: 'Neue Fragen',
    regenerate_questions: 'Fragen neu generieren',
    evaluating_answers: 'Antworten werden ausgewertet...',
    sections_questions_marks: '2 Abschnitte · 10 Fragen · 50 Punkte',
    questions_marks_each: 'Fragen · Punkte pro Frage',
    percentage: 'Prozentsatz',
    grade: 'Note',
    pass_threshold: 'Bestanden',
    mcq_section_label: 'Multiple Choice (Abschnitt 1)',
    fill_blank_section_label: 'Lückentext (Abschnitt 2)',
    review_suffix: '— Überprüfung',
    no_answer_selected: 'Keine Antwort ausgewählt',
    correct_marks: 'Richtig —',
    not_answered: 'Nicht beantwortet — 0 Punkte',
    incorrect_marks: 'Falsch — 0 Punkte',
    correct_answer_prefix: 'Richtig:',
    blank_placeholder: 'leer',
    correct_answer_label: 'Richtige Antwort:',

    admin_dashboard: 'Admin-Dashboard',
    teacher_portal: 'Lehrerportal',
    refresh_data: 'Daten aktualisieren',
    chapters_stat: 'Kapitel',
    topics_stat: 'Themen',
    with_content_stat: 'Mit Inhalt',
    navigation: 'Navigation',
    manage_chapters: 'Kapitel verwalten',
    manage_chapters_desc: 'Lektionskapitel erstellen und organisieren',
    manage_topics: 'Themen verwalten',
    manage_topics_desc: 'Themen innerhalb von Kapiteln hinzufügen',
    upload_content: 'Inhalt hochladen',
    upload_content_desc: 'Lektionsinhalt schreiben oder hochladen',
    sign_out: 'Abmelden',

    chapters_heading: 'Kapitel',
    add_chapter: 'Kapitel hinzufügen',
    no_chapters_yet: 'Noch keine Kapitel',
    no_chapters_desc: 'Klicken Sie auf "+ Kapitel hinzufügen", um Ihr erstes Kapitel zu erstellen',
    click_to_rename: 'zum Umbenennen klicken',
    delete_chapter: 'Kapitel löschen',
    delete_chapter_confirm: 'Möchten Sie dieses Kapitel wirklich löschen? Alle darin enthaltenen Themen und Inhalte werden dauerhaft entfernt.',
    topics_count: 'Themen',

    topics_heading: 'Themen',
    no_chapters_for_topics: 'Noch keine Kapitel',
    no_chapters_for_topics_desc: 'Erstellen Sie zuerst Kapitel, bevor Sie Themen hinzufügen',
    add_topic: 'Thema hinzufügen',
    no_topics_in_chapter_admin: 'Noch keine Themen in diesem Kapitel',
    add_first_topic: 'Erstes Thema hinzufügen',
    has_content: 'Hat Inhalt',
    no_content: 'Kein Inhalt',
    delete_topic: 'Thema löschen',
    delete_topic_confirm: 'Möchten Sie dieses Thema wirklich löschen? Alle hochgeladenen Inhalte für dieses Thema werden ebenfalls entfernt.',

    upload_content_heading: 'Inhalt hochladen',
    upload_content_sub: 'Wählen Sie ein Thema und eine Sprache aus, dann fügen Sie den Lektionsinhalt ein oder laden Sie ihn hoch',
    no_chapters_or_topics: 'Noch keine Kapitel oder Themen',
    no_chapters_or_topics_desc: 'Erstellen Sie zuerst Kapitel und Themen, bevor Sie Inhalte hochladen',
    select_topic: 'Thema auswählen',
    content_language: 'Inhaltssprache',
    select_topic_to_edit: 'Wählen Sie ein Thema aus, um mit der Bearbeitung zu beginnen',
    edit_tab: 'Bearbeiten',
    preview_tab: 'Vorschau',
    upload_txt: '.txt hochladen',
    content_preview: 'Inhaltsvorschau',
    no_content_to_preview: 'Kein Inhalt zur Vorschau',
    lesson_content_label: 'Lektionsinhalt',
    clear_content: 'Löschen',
    paste_content_placeholder: 'Fügen Sie Ihren Lektionsinhalt hier ein oder tippen Sie ihn...',
    content_tip: 'Tipp: Mehr Inhalt generiert bessere Quizfragen',
    content_uploaded_badge: 'Inhalt hochgeladen',
    no_content_badge: 'Noch kein Inhalt',
    saving: 'Wird gespeichert...',
    saved_successfully: 'Erfolgreich gespeichert',
    save_content: 'Inhalt speichern',

    cancel: 'Abbrechen',
    delete_confirm: 'Löschen',

    no_content_in_lang: 'Kein Inhalt verfügbar in',
    available_in: 'Verfügbar in:',

    badge_first_lesson: 'Erste Lektion',
    badge_first_lesson_desc: 'Ersten Test abgeschlossen',
    badge_on_fire: 'In Fahrt',
    badge_on_fire_desc: '3 Lektionen bestanden',
    badge_champion: 'Champion',
    badge_champion_desc: 'Alle Lektionen bestanden',
    badge_high_scorer: 'Top-Scorer',
    badge_high_scorer_desc: '80 %+ in einer Lektion erreicht',
    badge_persistent: 'Ausdauernd',
    badge_persistent_desc: 'Eine Lektion 3+ Mal versucht',
    badge_rocket: 'Raketenstart',
    badge_rocket_desc: '90 %+ beim ersten Versuch erreicht',

    login: 'Anmelden',
    register: 'Konto erstellen',
    email: 'E-Mail',
    password: 'Passwort',
    full_name: 'Vollständiger Name',
    native_language: 'Muttersprache',
    german_proficiency: 'Deutschkenntnisse',
    app_language: 'App-Sprache',
    role_label: 'Rolle',
    role_trainee: 'Teilnehmer',
    role_teacher: 'Lehrer',
    role_trainer: 'Ausbilder',
    proficiency_beginner: 'Anfänger',
    proficiency_intermediate: 'Mittelstufe',
    proficiency_advanced: 'Fortgeschritten',
    proficiency_native: 'Muttersprachler',
    no_account: 'Noch kein Konto?',
    has_account: 'Bereits ein Konto?',
    login_button: 'Anmelden',
    register_button: 'Konto erstellen',
    logging_in: 'Anmeldung läuft...',
    registering: 'Konto wird erstellt...',
    invalid_credentials: 'Ungültige E-Mail oder Passwort',
    email_in_use: 'Ein Konto mit dieser E-Mail existiert bereits',
    weak_password: 'Passwort muss mindestens 6 Zeichen lang sein',
    required_field: 'Dieses Feld ist erforderlich',
    trainer: 'Ausbilder',
    trainer_desc: 'Schulungsprogramme überwachen und den Fortschritt der Teilnehmer verfolgen',
    welcome_title: 'Willkommen auf der Lernplattform',
    welcome_subtitle: 'Melden Sie sich an oder erstellen Sie ein neues Konto',

    of: 'von',
  },

  tr: {
    greeting: 'Hoş Geldiniz',
    tagline: 'Sihrin gerçekleşmesini görmek için yazmaya (veya düzenlemeye) başlayın',
    selectLanguage: 'Dil Seçin',
    selectRole: 'Rolünüzü Seçin',
    trainee: 'Antrenör',
    teacher: 'Öğretmen',
    traineeDesc: 'Derslere erişin, testler yapın, performansınızı takip edin ve profilinizi yönetin',
    teacherDesc: 'Bölümleri ve konuları yönetin, katılımcılar için ders içeriği yükleyin',
    lessons: 'Dersler',
    performance: 'Performans',
    profile: 'Profil',
    home: 'Ana Sayfa',
    noLessons: 'Henüz ders yok',
    noPerformanceData: 'Performans verisi yok',
    profileName: 'Ad',
    profileEmail: 'E-posta',
    profileLevel: 'Seviye',
    signOut: 'Çıkış Yap',
    back: 'Geri',
    startTest: 'Testi Başlat',
    chapter: 'Bölüm',
    testTitle: 'Bilgi Testi',
    totalMarks: 'Toplam Puan',
    sectionMCQ: 'Bölüm 1: Çoktan Seçmeli Sorular',
    sectionShortAnswer: 'Bölüm 2: Kısa Cevaplı Sorular',
    sectionFillBlanks: 'Bölüm 3: Boşluk Doldurma',
    submitTest: 'Testi Gönder',
    marks: 'puan',
    yourAnswer: 'Cevabınız...',
    selectAnswer: 'Cevap seçin',
    testSubmitted: 'Test Gönderildi!',
    score: 'Puanınız',
    backToLesson: 'Derse Geri Dön',
    congratulations: 'Tebrikler, geçtiniz!',
    youPassed: 'Bu konuyu başarıyla tamamladınız. Şimdi bir sonrakine geçebilirsiniz.',
    needImprovement: 'Gelişmeniz gerekiyor.',
    repeatLesson: 'Dersi Tekrarla',
    nextTopic: 'Sonraki Konu',
    allTopicsComplete: 'Tüm konular tamamlandı!',
    languageNames: {
      en: 'İngilizce',
      de: 'Almanca',
      tr: 'Türkçe',
      ar: 'Arapça',
      ru: 'Rusça',
    },

    dashboard: 'Gösterge Paneli',
    daily_goal: 'Günlük Hedef',
    progress: 'İlerleme',
    recommended: 'Önerilen',
    overall_progress: 'Genel İlerleme',
    course_completion: 'Kurs tamamlama',
    ai_recommendation: 'Yapay Zeka Önerisi',
    ai_suggests_review: 'Yapay zeka bu dersin tekrarını öneriyor',
    ai_review_reason: 'Puanınız %60\'ın altındaydı — tekrar bu konuyu güçlendirecek.',
    review_lesson: 'Dersi Tekrarla',
    recommended_next: 'Sonraki Öneri',
    start_lesson: 'Dersi Başlat',
    competency_areas: 'Yeterlilik Alanları',
    needs_work: 'Geliştirilmeli',
    strong: 'Güçlü',
    not_started: 'Başlanmadı',
    weak_areas: 'Zayıf Alanlar — Tekrar Gerekli',
    achievement_badges: 'Başarı Rozetleri',
    browse_all_lessons: 'Tüm Derslere Göz At',
    welcome_back: 'Tekrar hoş geldiniz',
    start_first_lesson: 'Bugün ilk dersinize başlayın!',
    lessons_passed: 'ders geçildi',
    xp: 'XP',
    avg: '% ort.',
    passed_label: 'geçildi',
    goal_complete: 'Hedef tamamlandı!',
    lessons_today: 'bugün ders',
    all_lessons_done_today: 'bugün için ders tamamlandı',
    done: 'tamamlandı',
    remaining: 'kalan',
    topics_passed: 'konu geçildi',
    lessons_completed_xp: 'ders tamamlandı',

    performance_overview: 'Performans Özeti',
    lessons_tracked: 'ders takip edildi',
    clear_history: 'Geçmişi temizle',
    lessons_tracked_label: 'Takip Edilen Dersler',
    passed_stat: 'Geçildi',
    avg_score: 'Ort. Puan',
    total_attempts: 'Toplam Deneme',
    across_all_lessons: 'tüm dersler genelinde',
    lesson_results: 'Ders Sonuçları',
    pass_fail_summary: 'Geçti / Kaldı Özeti',
    all_lessons_done: 'Tüm dersler tamamlandı!',
    lessons_completed_of: 'ders tamamlandı',
    course_completion_label: 'Kurs Tamamlama',
    pass_rate: '% geçme oranı',
    attempts_label: 'Denemeler:',
    pass_badge: 'GEÇTİ',
    fail_badge: 'KALDI',
    failed_label: 'kaldı',
    complete_lesson_prompt: 'Sonuçlarınızı görmek için bir ders testi tamamlayın.',
    you_are_improving: 'Gelişiyorsunuz',
    you_are_improving_desc: 'Son puanlarınız yükselme eğiliminde. Böyle devam edin!',
    excellent_performance: 'Mükemmel performans',
    excellent_performance_desc: 'Tüm derslerde sürekli yüksek puanlar. Olağanüstü çalışma!',
    needs_more_practice: 'Daha fazla pratik gerekli',
    needs_more_practice_desc: 'Puanlarınız, yeniden denemeden önce ders içeriğini gözden geçirmenizi öneriyor.',
    steady_progress: 'Sabit ilerleme',
    steady_progress_desc: 'Sağlam ilerleme kaydediyorsunuz. Her derste daha yüksek puanlar almaya çalışın.',

    loading_lessons: 'Dersler yükleniyor...',
    no_lessons_yet: 'Henüz ders mevcut değil.',
    weak_label: 'zayıf',
    no_topics_in_chapter: 'Bu bölümde konu yok.',
    weak_area_score: 'Zayıf alan — puan',
    passed_score: 'Geçildi —',

    no_content_available: 'Ders içeriği mevcut değil',
    no_content_available_desc: 'Öğretmen bu konu için henüz içerik yüklemedi. Daha sonra tekrar kontrol edin veya eğitmeninizle iletişime geçin.',
    back_to_lesson: 'Derse Geri Dön',
    generating_test: 'Testiniz oluşturuluyor...',
    generating_test_desc: 'Ders içeriğinden benzersiz sorular oluşturuluyor',
    new_questions: 'Yeni Sorular',
    regenerate_questions: 'Soruları yeniden oluştur',
    evaluating_answers: 'Cevaplar değerlendiriliyor...',
    sections_questions_marks: '2 bölüm · 10 soru · 50 puan',
    questions_marks_each: 'soru · her biri puan',
    percentage: 'Yüzde',
    grade: 'Not',
    pass_threshold: 'Geçme',
    mcq_section_label: 'Çoktan Seçmeli (Bölüm 1)',
    fill_blank_section_label: 'Boşluk Doldurma (Bölüm 2)',
    review_suffix: '— İnceleme',
    no_answer_selected: 'Cevap seçilmedi',
    correct_marks: 'Doğru —',
    not_answered: 'Cevaplanmadı — 0 puan',
    incorrect_marks: 'Yanlış — 0 puan',
    correct_answer_prefix: 'Doğru:',
    blank_placeholder: 'boş',
    correct_answer_label: 'Doğru cevap:',

    admin_dashboard: 'Yönetici Paneli',
    teacher_portal: 'Öğretmen Portalı',
    refresh_data: 'Verileri yenile',
    chapters_stat: 'Bölümler',
    topics_stat: 'Konular',
    with_content_stat: 'İçerikli',
    navigation: 'Navigasyon',
    manage_chapters: 'Bölümleri Yönet',
    manage_chapters_desc: 'Ders bölümleri oluşturun ve düzenleyin',
    manage_topics: 'Konuları Yönet',
    manage_topics_desc: 'Bölümler içinde konular ekleyin',
    upload_content: 'İçerik Yükle',
    upload_content_desc: 'Ders içeriği yazın veya yükleyin',
    sign_out: 'Çıkış Yap',

    chapters_heading: 'Bölümler',
    add_chapter: 'Bölüm Ekle',
    no_chapters_yet: 'Henüz bölüm yok',
    no_chapters_desc: 'İlk bölümünüzü oluşturmak için "+ Bölüm Ekle"ye tıklayın',
    click_to_rename: 'yeniden adlandırmak için tıklayın',
    delete_chapter: 'Bölümü Sil',
    delete_chapter_confirm: 'Bu bölümü silmek istediğinizden emin misiniz? İçindeki tüm konular ve içerikler kalıcı olarak kaldırılacak.',
    topics_count: 'konu',

    topics_heading: 'Konular',
    no_chapters_for_topics: 'Henüz bölüm yok',
    no_chapters_for_topics_desc: 'Konu eklemeden önce bölüm oluşturun',
    add_topic: 'Konu ekle',
    no_topics_in_chapter_admin: 'Bu bölümde henüz konu yok',
    add_first_topic: 'İlk Konuyu Ekle',
    has_content: 'İçerik var',
    no_content: 'İçerik yok',
    delete_topic: 'Konuyu Sil',
    delete_topic_confirm: 'Bu konuyu silmek istediğinizden emin misiniz? Bu konu için yüklenen tüm içerikler de kaldırılacak.',

    upload_content_heading: 'İçerik Yükle',
    upload_content_sub: 'Bir konu ve dil seçin, ardından ders içeriğini yapıştırın veya yükleyin',
    no_chapters_or_topics: 'Henüz bölüm veya konu yok',
    no_chapters_or_topics_desc: 'İçerik yüklemeden önce bölüm ve konu oluşturun',
    select_topic: 'Konu Seç',
    content_language: 'İçerik Dili',
    select_topic_to_edit: 'İçerik düzenlemeye başlamak için bir konu seçin',
    edit_tab: 'Düzenle',
    preview_tab: 'Önizleme',
    upload_txt: '.txt Yükle',
    content_preview: 'İçerik Önizleme',
    no_content_to_preview: 'Önizlenecek içerik yok',
    lesson_content_label: 'Ders İçeriği',
    clear_content: 'Temizle',
    paste_content_placeholder: 'Ders içeriğinizi buraya yapıştırın veya yazın...',
    content_tip: 'İpucu: Daha fazla içerik daha iyi sorular üretir',
    content_uploaded_badge: 'İçerik yüklendi',
    no_content_badge: 'Henüz içerik yok',
    saving: 'Kaydediliyor...',
    saved_successfully: 'Başarıyla kaydedildi',
    save_content: 'İçeriği Kaydet',

    cancel: 'İptal',
    delete_confirm: 'Sil',

    no_content_in_lang: 'Şu dilde içerik yok:',
    available_in: 'Mevcut diller:',

    badge_first_lesson: 'İlk Ders',
    badge_first_lesson_desc: 'İlk testinizi tamamladınız',
    badge_on_fire: 'Ateşli',
    badge_on_fire_desc: '3 ders geçildi',
    badge_champion: 'Şampiyon',
    badge_champion_desc: 'Tüm dersler geçildi',
    badge_high_scorer: 'Yüksek Puanlı',
    badge_high_scorer_desc: 'Bir derste %80+ puan aldınız',
    badge_persistent: 'Azimli',
    badge_persistent_desc: 'Bir dersi 3+ kez denendi',
    badge_rocket: 'Roket Başlangıç',
    badge_rocket_desc: 'İlk denemede %90+ aldınız',

    login: 'Giriş Yap',
    register: 'Hesap Oluştur',
    email: 'E-posta',
    password: 'Şifre',
    full_name: 'Tam Ad',
    native_language: 'Ana Dil',
    german_proficiency: 'Almanca Seviyesi',
    app_language: 'Uygulama Dili',
    role_label: 'Rol',
    role_trainee: 'Antrenör',
    role_teacher: 'Öğretmen',
    role_trainer: 'Eğitmen',
    proficiency_beginner: 'Başlangıç',
    proficiency_intermediate: 'Orta',
    proficiency_advanced: 'İleri',
    proficiency_native: 'Ana Dil',
    no_account: 'Hesabınız yok mu?',
    has_account: 'Zaten hesabınız var mı?',
    login_button: 'Giriş Yap',
    register_button: 'Hesap Oluştur',
    logging_in: 'Giriş yapılıyor...',
    registering: 'Hesap oluşturuluyor...',
    invalid_credentials: 'Geçersiz e-posta veya şifre',
    email_in_use: 'Bu e-posta ile zaten bir hesap var',
    weak_password: 'Şifre en az 6 karakter olmalıdır',
    required_field: 'Bu alan zorunludur',
    trainer: 'Eğitmen',
    trainer_desc: 'Eğitim programlarını denetleyin ve katılımcı ilerlemesini izleyin',
    welcome_title: 'Öğrenme Platformuna Hoş Geldiniz',
    welcome_subtitle: 'Devam etmek için giriş yapın veya yeni bir hesap oluşturun',

    of: '/',
  },

  ar: {
    greeting: 'مرحباً',
    tagline: 'ابدأ بالكتابة (أو التحرير) لرؤية السحر يحدث',
    selectLanguage: 'اختر اللغة',
    selectRole: 'اختر دورك',
    trainee: 'متدرب',
    teacher: 'معلم',
    traineeDesc: 'الوصول إلى الدروس وإجراء الاختبارات وتتبع أدائك وإدارة ملفك الشخصي',
    teacherDesc: 'إدارة الفصول والمواضيع ورفع محتوى الدروس للمتدربين',
    lessons: 'الدروس',
    performance: 'الأداء',
    profile: 'الملف الشخصي',
    home: 'الرئيسية',
    noLessons: 'لا توجد دروس متاحة حتى الآن',
    noPerformanceData: 'لا توجد بيانات أداء',
    profileName: 'الاسم',
    profileEmail: 'البريد الإلكتروني',
    profileLevel: 'المستوى',
    signOut: 'تسجيل الخروج',
    back: 'رجوع',
    startTest: 'بدء الاختبار',
    chapter: 'الفصل',
    testTitle: 'اختبار المعرفة',
    totalMarks: 'مجموع الدرجات',
    sectionMCQ: 'القسم 1: أسئلة الاختيار من متعدد',
    sectionShortAnswer: 'القسم 2: أسئلة الإجابة القصيرة',
    sectionFillBlanks: 'القسم 3: ملء الفراغات',
    submitTest: 'تسليم الاختبار',
    marks: 'درجة',
    yourAnswer: 'إجابتك...',
    selectAnswer: 'اختر إجابة',
    testSubmitted: 'تم تسليم الاختبار!',
    score: 'درجتك',
    backToLesson: 'العودة إلى الدرس',
    congratulations: 'تهانينا، لقد نجحت!',
    youPassed: 'لقد أكملت هذا الموضوع بنجاح. يمكنك الآن الانتقال إلى الموضوع التالي.',
    needImprovement: 'تحتاج إلى التحسين.',
    repeatLesson: 'إعادة الدرس',
    nextTopic: 'الموضوع التالي',
    allTopicsComplete: 'تم إكمال جميع المواضيع!',
    languageNames: {
      en: 'الإنجليزية',
      de: 'الألمانية',
      tr: 'التركية',
      ar: 'العربية',
      ru: 'الروسية',
    },

    dashboard: 'لوحة التحكم',
    daily_goal: 'الهدف اليومي',
    progress: 'التقدم',
    recommended: 'موصى به',
    overall_progress: 'التقدم العام',
    course_completion: 'إتمام الدورة',
    ai_recommendation: 'توصية الذكاء الاصطناعي',
    ai_suggests_review: 'يوصي الذكاء الاصطناعي بمراجعة هذا الدرس',
    ai_review_reason: 'كانت درجتك أقل من 60٪ — المراجعة ستقوي هذا الموضوع.',
    review_lesson: 'مراجعة الدرس',
    recommended_next: 'الموصى به التالي',
    start_lesson: 'بدء الدرس',
    competency_areas: 'مجالات الكفاءة',
    needs_work: 'يحتاج عمل',
    strong: 'قوي',
    not_started: 'لم يبدأ',
    weak_areas: 'المجالات الضعيفة — مراجعة مطلوبة',
    achievement_badges: 'شارات الإنجاز',
    browse_all_lessons: 'تصفح جميع الدروس',
    welcome_back: 'مرحباً بعودتك',
    start_first_lesson: 'ابدأ درسك الأول اليوم!',
    lessons_passed: 'دروس تم اجتيازها',
    xp: 'XP',
    avg: '٪ متوسط',
    passed_label: 'اجتاز',
    goal_complete: 'اكتمل الهدف!',
    lessons_today: 'دروس اليوم',
    all_lessons_done_today: 'دروس أُنجزت لهذا اليوم',
    done: 'تم',
    remaining: 'متبقٍ',
    topics_passed: 'مواضيع تم اجتيازها',
    lessons_completed_xp: 'دروس مكتملة',

    performance_overview: 'نظرة عامة على الأداء',
    lessons_tracked: 'دروس مُتتبَّعة',
    clear_history: 'مسح السجل',
    lessons_tracked_label: 'الدروس المتتبعة',
    passed_stat: 'اجتاز',
    avg_score: 'متوسط الدرجات',
    total_attempts: 'إجمالي المحاولات',
    across_all_lessons: 'عبر جميع الدروس',
    lesson_results: 'نتائج الدروس',
    pass_fail_summary: 'ملخص النجاح / الرسوب',
    all_lessons_done: 'تم إنجاز جميع الدروس!',
    lessons_completed_of: 'دروس مكتملة',
    course_completion_label: 'إتمام الدورة',
    pass_rate: '٪ معدل النجاح',
    attempts_label: 'المحاولات:',
    pass_badge: 'نجاح',
    fail_badge: 'رسوب',
    failed_label: 'رسب',
    complete_lesson_prompt: 'أكمل اختبار درس لرؤية نتائجك هنا.',
    you_are_improving: 'أنت تتحسن',
    you_are_improving_desc: 'درجاتك الأخيرة في تصاعد. استمر على هذا النحو!',
    excellent_performance: 'أداء ممتاز',
    excellent_performance_desc: 'درجات عالية باستمرار في جميع الدروس. عمل رائع!',
    needs_more_practice: 'يحتاج إلى مزيد من التدريب',
    needs_more_practice_desc: 'تشير درجاتك إلى مراجعة محتوى الدرس قبل إعادة المحاولة.',
    steady_progress: 'تقدم ثابت',
    steady_progress_desc: 'أنت تحرز تقدماً ثابتاً. حاول الحصول على درجات أعلى في كل درس.',

    loading_lessons: 'جارٍ تحميل الدروس...',
    no_lessons_yet: 'لا توجد دروس متاحة بعد.',
    weak_label: 'ضعيف',
    no_topics_in_chapter: 'لا توجد مواضيع في هذا الفصل.',
    weak_area_score: 'منطقة ضعيفة — الدرجة',
    passed_score: 'اجتاز —',

    no_content_available: 'لا يوجد محتوى للدرس',
    no_content_available_desc: 'لم يقم المعلم بتحميل محتوى لهذا الموضوع بعد. تحقق لاحقاً أو تواصل مع مدربك.',
    back_to_lesson: 'العودة إلى الدرس',
    generating_test: 'جارٍ إنشاء اختبارك...',
    generating_test_desc: 'إنشاء أسئلة فريدة من محتوى الدرس',
    new_questions: 'أسئلة جديدة',
    regenerate_questions: 'إعادة إنشاء الأسئلة',
    evaluating_answers: 'جارٍ تقييم الإجابات...',
    sections_questions_marks: '2 قسم · 10 أسئلة · 50 درجة',
    questions_marks_each: 'أسئلة · درجات لكل',
    percentage: 'النسبة المئوية',
    grade: 'الدرجة',
    pass_threshold: 'النجاح',
    mcq_section_label: 'الاختيار من متعدد (القسم 1)',
    fill_blank_section_label: 'ملء الفراغات (القسم 2)',
    review_suffix: '— مراجعة',
    no_answer_selected: 'لم يتم اختيار إجابة',
    correct_marks: 'صحيح —',
    not_answered: 'لم يُجب — 0 درجات',
    incorrect_marks: 'خاطئ — 0 درجات',
    correct_answer_prefix: 'صحيح:',
    blank_placeholder: 'فراغ',
    correct_answer_label: 'الإجابة الصحيحة:',

    admin_dashboard: 'لوحة الإدارة',
    teacher_portal: 'بوابة المعلم',
    refresh_data: 'تحديث البيانات',
    chapters_stat: 'الفصول',
    topics_stat: 'المواضيع',
    with_content_stat: 'مع محتوى',
    navigation: 'التنقل',
    manage_chapters: 'إدارة الفصول',
    manage_chapters_desc: 'إنشاء وتنظيم فصول الدروس',
    manage_topics: 'إدارة المواضيع',
    manage_topics_desc: 'إضافة مواضيع داخل الفصول',
    upload_content: 'رفع المحتوى',
    upload_content_desc: 'كتابة أو رفع محتوى الدرس',
    sign_out: 'تسجيل الخروج',

    chapters_heading: 'الفصول',
    add_chapter: 'إضافة فصل',
    no_chapters_yet: 'لا توجد فصول بعد',
    no_chapters_desc: 'انقر على "+ إضافة فصل" لإنشاء فصلك الأول',
    click_to_rename: 'انقر لإعادة التسمية',
    delete_chapter: 'حذف الفصل',
    delete_chapter_confirm: 'هل أنت متأكد من حذف هذا الفصل؟ سيتم إزالة جميع المواضيع والمحتوى داخله بشكل دائم.',
    topics_count: 'مواضيع',

    topics_heading: 'المواضيع',
    no_chapters_for_topics: 'لا توجد فصول بعد',
    no_chapters_for_topics_desc: 'أنشئ فصولاً أولاً قبل إضافة مواضيع',
    add_topic: 'إضافة موضوع',
    no_topics_in_chapter_admin: 'لا توجد مواضيع في هذا الفصل بعد',
    add_first_topic: 'إضافة الموضوع الأول',
    has_content: 'يحتوي على محتوى',
    no_content: 'لا يوجد محتوى',
    delete_topic: 'حذف الموضوع',
    delete_topic_confirm: 'هل أنت متأكد من حذف هذا الموضوع؟ سيتم أيضاً إزالة جميع المحتوى المحمّل لهذا الموضوع.',

    upload_content_heading: 'رفع المحتوى',
    upload_content_sub: 'اختر موضوعاً ولغة، ثم الصق محتوى الدرس أو ارفعه',
    no_chapters_or_topics: 'لا توجد فصول أو مواضيع بعد',
    no_chapters_or_topics_desc: 'أنشئ فصولاً ومواضيع أولاً قبل رفع المحتوى',
    select_topic: 'اختر الموضوع',
    content_language: 'لغة المحتوى',
    select_topic_to_edit: 'اختر موضوعاً للبدء في تحرير المحتوى',
    edit_tab: 'تحرير',
    preview_tab: 'معاينة',
    upload_txt: 'رفع .txt',
    content_preview: 'معاينة المحتوى',
    no_content_to_preview: 'لا يوجد محتوى للمعاينة',
    lesson_content_label: 'محتوى الدرس',
    clear_content: 'مسح',
    paste_content_placeholder: 'الصق أو اكتب محتوى الدرس هنا...',
    content_tip: 'نصيحة: المزيد من المحتوى ينتج أسئلة اختبار أفضل',
    content_uploaded_badge: 'تم رفع المحتوى',
    no_content_badge: 'لا يوجد محتوى بعد',
    saving: 'جارٍ الحفظ...',
    saved_successfully: 'تم الحفظ بنجاح',
    save_content: 'حفظ المحتوى',

    cancel: 'إلغاء',
    delete_confirm: 'حذف',

    no_content_in_lang: 'لا يوجد محتوى باللغة',
    available_in: 'متاح باللغات:',

    badge_first_lesson: 'الدرس الأول',
    badge_first_lesson_desc: 'أكملت أول اختبار',
    badge_on_fire: 'في تأجج',
    badge_on_fire_desc: 'اجتاز 3 دروس',
    badge_champion: 'بطل',
    badge_champion_desc: 'اجتاز جميع الدروس',
    badge_high_scorer: 'متفوق',
    badge_high_scorer_desc: 'حصل على 80٪+ في درس',
    badge_persistent: 'مثابر',
    badge_persistent_desc: 'حاول درساً 3+ مرات',
    badge_rocket: 'انطلاق صاروخي',
    badge_rocket_desc: 'حصل على 90٪+ في المحاولة الأولى',

    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    full_name: 'الاسم الكامل',
    native_language: 'اللغة الأم',
    german_proficiency: 'مستوى الألمانية',
    app_language: 'لغة التطبيق',
    role_label: 'الدور',
    role_trainee: 'متدرب',
    role_teacher: 'معلم',
    role_trainer: 'مدرب',
    proficiency_beginner: 'مبتدئ',
    proficiency_intermediate: 'متوسط',
    proficiency_advanced: 'متقدم',
    proficiency_native: 'ناطق أصلي',
    no_account: 'ليس لديك حساب؟',
    has_account: 'لديك حساب بالفعل؟',
    login_button: 'تسجيل الدخول',
    register_button: 'إنشاء حساب',
    logging_in: 'جارٍ تسجيل الدخول...',
    registering: 'جارٍ إنشاء الحساب...',
    invalid_credentials: 'بريد إلكتروني أو كلمة مرور غير صالحة',
    email_in_use: 'يوجد حساب بهذا البريد الإلكتروني بالفعل',
    weak_password: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    required_field: 'هذا الحقل مطلوب',
    trainer: 'مدرب',
    trainer_desc: 'الإشراف على برامج التدريب ومتابعة تقدم المتدربين',
    welcome_title: 'مرحباً بك في منصة التعلم',
    welcome_subtitle: 'سجل الدخول للمتابعة أو أنشئ حساباً جديداً',

    of: 'من',
  },

  ru: {
    greeting: 'Добро пожаловать',
    tagline: 'Начните вводить текст (или редактировать), чтобы увидеть волшебство',
    selectLanguage: 'Выбрать язык',
    selectRole: 'Выберите свою роль',
    trainee: 'Стажер',
    teacher: 'Учитель',
    traineeDesc: 'Доступ к урокам, прохождение тестов, отслеживание успеваемости и управление профилем',
    teacherDesc: 'Управление главами, темами и загрузка учебного контента для стажёров',
    lessons: 'Уроки',
    performance: 'Производительность',
    profile: 'Профиль',
    home: 'Главная',
    noLessons: 'Уроков пока нет',
    noPerformanceData: 'Нет данных о производительности',
    profileName: 'Имя',
    profileEmail: 'Электронная почта',
    profileLevel: 'Уровень',
    signOut: 'Выход',
    back: 'Назад',
    startTest: 'Начать тест',
    chapter: 'Глава',
    testTitle: 'Тест знаний',
    totalMarks: 'Общий балл',
    sectionMCQ: 'Раздел 1: Вопросы с выбором ответа',
    sectionShortAnswer: 'Раздел 2: Вопросы с кратким ответом',
    sectionFillBlanks: 'Раздел 3: Заполнить пропуски',
    submitTest: 'Сдать тест',
    marks: 'баллов',
    yourAnswer: 'Ваш ответ...',
    selectAnswer: 'Выберите ответ',
    testSubmitted: 'Тест сдан!',
    score: 'Ваш результат',
    backToLesson: 'Вернуться к уроку',
    congratulations: 'Поздравляем, вы прошли!',
    youPassed: 'Вы успешно завершили эту тему. Теперь вы можете перейти к следующей.',
    needImprovement: 'Вам нужно улучшить свои результаты.',
    repeatLesson: 'Повторить урок',
    nextTopic: 'Следующая тема',
    allTopicsComplete: 'Все темы завершены!',
    languageNames: {
      en: 'Английский',
      de: 'Немецкий',
      tr: 'Турецкий',
      ar: 'Арабский',
      ru: 'Русский',
    },

    dashboard: 'Панель управления',
    daily_goal: 'Дневная цель',
    progress: 'Прогресс',
    recommended: 'Рекомендовано',
    overall_progress: 'Общий прогресс',
    course_completion: 'Завершение курса',
    ai_recommendation: 'Рекомендация ИИ',
    ai_suggests_review: 'ИИ рекомендует повторить этот урок',
    ai_review_reason: 'Ваш результат был ниже 60% — повторение укрепит эту тему.',
    review_lesson: 'Повторить урок',
    recommended_next: 'Следующая рекомендация',
    start_lesson: 'Начать урок',
    competency_areas: 'Области компетенций',
    needs_work: 'Нужна работа',
    strong: 'Сильный',
    not_started: 'Не начато',
    weak_areas: 'Слабые области — требуется повторение',
    achievement_badges: 'Значки достижений',
    browse_all_lessons: 'Просмотр всех уроков',
    welcome_back: 'С возвращением',
    start_first_lesson: 'Начните свой первый урок сегодня!',
    lessons_passed: 'уроков пройдено',
    xp: 'XP',
    avg: '% ср.',
    passed_label: 'пройдено',
    goal_complete: 'Цель выполнена!',
    lessons_today: 'уроков сегодня',
    all_lessons_done_today: 'уроков сделано сегодня',
    done: 'выполнено',
    remaining: 'осталось',
    topics_passed: 'тем пройдено',
    lessons_completed_xp: 'уроков завершено',

    performance_overview: 'Обзор успеваемости',
    lessons_tracked: 'уроков отслежено',
    clear_history: 'Очистить историю',
    lessons_tracked_label: 'Отслеженные уроки',
    passed_stat: 'Пройдено',
    avg_score: 'Средний балл',
    total_attempts: 'Всего попыток',
    across_all_lessons: 'по всем урокам',
    lesson_results: 'Результаты уроков',
    pass_fail_summary: 'Сводка успехов / неудач',
    all_lessons_done: 'Все уроки завершены!',
    lessons_completed_of: 'уроков завершено',
    course_completion_label: 'Завершение курса',
    pass_rate: '% успеваемость',
    attempts_label: 'Попытки:',
    pass_badge: 'СДАНО',
    fail_badge: 'НЕ СДАНО',
    failed_label: 'не сдано',
    complete_lesson_prompt: 'Пройдите тест по уроку, чтобы увидеть результаты здесь.',
    you_are_improving: 'Вы прогрессируете',
    you_are_improving_desc: 'Ваши последние результаты растут. Продолжайте в том же духе!',
    excellent_performance: 'Отличная успеваемость',
    excellent_performance_desc: 'Стабильно высокие результаты по всем урокам. Выдающаяся работа!',
    needs_more_practice: 'Требуется больше практики',
    needs_more_practice_desc: 'Ваши результаты предполагают повторение материала урока перед повторной попыткой.',
    steady_progress: 'Стабильный прогресс',
    steady_progress_desc: 'Вы делаете стабильный прогресс. Старайтесь набирать больше баллов в каждом уроке.',

    loading_lessons: 'Загрузка уроков...',
    no_lessons_yet: 'Уроков пока нет.',
    weak_label: 'слабый',
    no_topics_in_chapter: 'В этой главе нет тем.',
    weak_area_score: 'Слабая область — результат',
    passed_score: 'Пройдено —',

    no_content_available: 'Нет учебного контента',
    no_content_available_desc: 'Учитель ещё не загрузил контент для этой темы. Проверьте позже или обратитесь к инструктору.',
    back_to_lesson: 'Вернуться к уроку',
    generating_test: 'Генерация теста...',
    generating_test_desc: 'Создание уникальных вопросов из учебного контента',
    new_questions: 'Новые вопросы',
    regenerate_questions: 'Пересоздать вопросы',
    evaluating_answers: 'Оценка ответов...',
    sections_questions_marks: '2 раздела · 10 вопросов · 50 баллов',
    questions_marks_each: 'вопросов · баллов за каждый',
    percentage: 'Процент',
    grade: 'Оценка',
    pass_threshold: 'Проходной балл',
    mcq_section_label: 'Выбор ответа (Раздел 1)',
    fill_blank_section_label: 'Заполнить пропуски (Раздел 2)',
    review_suffix: '— Проверка',
    no_answer_selected: 'Ответ не выбран',
    correct_marks: 'Правильно —',
    not_answered: 'Не отвечено — 0 баллов',
    incorrect_marks: 'Неверно — 0 баллов',
    correct_answer_prefix: 'Правильно:',
    blank_placeholder: 'пусто',
    correct_answer_label: 'Правильный ответ:',

    admin_dashboard: 'Панель администратора',
    teacher_portal: 'Портал учителя',
    refresh_data: 'Обновить данные',
    chapters_stat: 'Главы',
    topics_stat: 'Темы',
    with_content_stat: 'С контентом',
    navigation: 'Навигация',
    manage_chapters: 'Управление главами',
    manage_chapters_desc: 'Создание и организация глав уроков',
    manage_topics: 'Управление темами',
    manage_topics_desc: 'Добавление тем в главы',
    upload_content: 'Загрузить контент',
    upload_content_desc: 'Написать или загрузить учебный контент',
    sign_out: 'Выйти',

    chapters_heading: 'Главы',
    add_chapter: 'Добавить главу',
    no_chapters_yet: 'Глав пока нет',
    no_chapters_desc: 'Нажмите "+ Добавить главу", чтобы создать первую главу',
    click_to_rename: 'нажмите для переименования',
    delete_chapter: 'Удалить главу',
    delete_chapter_confirm: 'Вы уверены, что хотите удалить эту главу? Все темы и контент внутри будут удалены навсегда.',
    topics_count: 'тем',

    topics_heading: 'Темы',
    no_chapters_for_topics: 'Глав пока нет',
    no_chapters_for_topics_desc: 'Сначала создайте главы, затем добавляйте темы',
    add_topic: 'Добавить тему',
    no_topics_in_chapter_admin: 'В этой главе ещё нет тем',
    add_first_topic: 'Добавить первую тему',
    has_content: 'Есть контент',
    no_content: 'Нет контента',
    delete_topic: 'Удалить тему',
    delete_topic_confirm: 'Вы уверены, что хотите удалить эту тему? Весь загруженный контент для этой темы также будет удалён.',

    upload_content_heading: 'Загрузить контент',
    upload_content_sub: 'Выберите тему и язык, затем вставьте или загрузите учебный контент',
    no_chapters_or_topics: 'Глав и тем пока нет',
    no_chapters_or_topics_desc: 'Сначала создайте главы и темы, затем загружайте контент',
    select_topic: 'Выбрать тему',
    content_language: 'Язык контента',
    select_topic_to_edit: 'Выберите тему, чтобы начать редактирование',
    edit_tab: 'Редактировать',
    preview_tab: 'Предпросмотр',
    upload_txt: 'Загрузить .txt',
    content_preview: 'Предпросмотр контента',
    no_content_to_preview: 'Нет контента для предпросмотра',
    lesson_content_label: 'Учебный контент',
    clear_content: 'Очистить',
    paste_content_placeholder: 'Вставьте или введите учебный контент здесь...',
    content_tip: 'Подсказка: Больше контента — лучше вопросы для теста',
    content_uploaded_badge: 'Контент загружен',
    no_content_badge: 'Контента пока нет',
    saving: 'Сохранение...',
    saved_successfully: 'Успешно сохранено',
    save_content: 'Сохранить контент',

    cancel: 'Отмена',
    delete_confirm: 'Удалить',

    no_content_in_lang: 'Нет контента на языке',
    available_in: 'Доступно на:',

    badge_first_lesson: 'Первый урок',
    badge_first_lesson_desc: 'Завершили первый тест',
    badge_on_fire: 'В огне',
    badge_on_fire_desc: 'Пройдено 3 урока',
    badge_champion: 'Чемпион',
    badge_champion_desc: 'Пройдены все уроки',
    badge_high_scorer: 'Высокий результат',
    badge_high_scorer_desc: 'Набрали 80%+ в уроке',
    badge_persistent: 'Настойчивый',
    badge_persistent_desc: 'Попытался выполнить урок 3+ раза',
    badge_rocket: 'Ракетный старт',
    badge_rocket_desc: 'Набрали 90%+ с первой попытки',

    login: 'Войти',
    register: 'Создать аккаунт',
    email: 'Электронная почта',
    password: 'Пароль',
    full_name: 'Полное имя',
    native_language: 'Родной язык',
    german_proficiency: 'Уровень немецкого',
    app_language: 'Язык приложения',
    role_label: 'Роль',
    role_trainee: 'Стажер',
    role_teacher: 'Учитель',
    role_trainer: 'Тренер',
    proficiency_beginner: 'Начинающий',
    proficiency_intermediate: 'Средний',
    proficiency_advanced: 'Продвинутый',
    proficiency_native: 'Носитель языка',
    no_account: 'Нет аккаунта?',
    has_account: 'Уже есть аккаунт?',
    login_button: 'Войти',
    register_button: 'Создать аккаунт',
    logging_in: 'Вход в систему...',
    registering: 'Создание аккаунта...',
    invalid_credentials: 'Неверный адрес электронной почты или пароль',
    email_in_use: 'Аккаунт с этой почтой уже существует',
    weak_password: 'Пароль должен содержать не менее 6 символов',
    required_field: 'Это поле обязательно',
    trainer: 'Тренер',
    trainer_desc: 'Контролируйте учебные программы и отслеживайте прогресс стажёров',
    welcome_title: 'Добро пожаловать на обучающую платформу',
    welcome_subtitle: 'Войдите в систему или создайте новый аккаунт',

    of: 'из',
  },
};

export const rtlLanguages: Language[] = ['ar'];

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  tr: '🇹🇷',
  ar: '🇸🇦',
  ru: '🇷🇺',
};
