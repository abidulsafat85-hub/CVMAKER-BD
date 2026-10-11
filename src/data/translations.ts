export type Language = 'en' | 'bn';

export const TRANSLATIONS = {
  en: {
    appName: 'CV Maker',
    tagline: 'Professional Modern Resume Builder',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Generating PDF...',
    printPdf: 'Print / Save as PDF',
    fitOnePage: 'Fit on 1 Page',
    fitOnePageActive: '1-Page Fit Active',
    clearAllData: 'Clear All Data',
    clearConfirm: 'Are you sure you want to clear all data? This will reset the CV to a blank template.',
    resetSample: 'Load Sample',
    resetConfirm: 'Reset CV with realistic sample data?',
    installApp: 'Install App',
    installed: 'Installed',
    editor: 'Editor',
    preview: 'Preview',
    themeColor: 'Theme Accent Color',
    livePreviewTitle: 'Live A4 Preview',
    realTimeSync: 'Real-time sync',
    offlineNotice: 'Offline mode · All changes saved to this device',
    
    // Personal Details
    personalInfo: 'Personal Information',
    photoUpload: 'Upload Photo',
    removePhoto: 'Remove Photo',
    showPhoto: 'Show in CV',
    photoReq: 'Max 5MB (JPG/PNG). High-definition 3:4 passport crop with auto white background.',
    fullName: 'Full Name',
    jobTitle: 'Job Title / Designation',
    email: 'Email',
    phone: 'Phone Number',
    website: 'Portfolio / LinkedIn / Website',
    birthDate: 'Date of Birth',
    gender: 'Gender',
    
    // Accounts & Social Profiles (Optional)
    accountsTitle: 'Online Accounts & Social Profiles',
    accountsSubtitle: 'LinkedIn, GitHub, Instagram, Facebook, X, Portfolio, etc. (Completely Optional)',
    addAccount: 'Add Account',
    accountName: 'Account / Platform Name',
    accountLinkOrHandle: 'Username or Profile URL',
    customAccountName: 'Platform Name (e.g. Behance, Medium)',
    optionalBadge: 'Optional',
    noAccountsYet: 'No accounts added yet. Click "+ Add Account" or a preset to add your profiles, or leave empty.',
    
    // Address
    presentAddress: 'Present Address',
    permanentAddress: 'Permanent Address',
    sameAsPresent: 'Same as present address',
    country: 'Country',
    division: 'Division / State',
    district: 'District',
    thana: 'Thana / Upazila / City',
    streetLine: 'House, Road, Village, Post Code (Optional Line)',
    selectCountryFirst: 'Please select a country first',
    
    // Objective
    objective: 'Career Objective',
    objectivePlaceholder: 'Write a compelling career summary highlighting your goals and strengths...',
    
    // Education
    education: 'Educational Qualifications',
    addEducation: 'Add Education',
    level: 'Education Level',
    institution: 'Institution / University',
    institutionPlaceholder: 'Select popular university or enter custom name...',
    board: 'Education Board',
    group: 'Group',
    department: 'Course / Department',
    departmentPlaceholder: 'Type to search (e.g. c for CSE, s for Software)...',
    college: 'College Name',
    school: 'School Name',
    passingYear: 'Passing Year',
    cgpaVarsity: 'CGPA',
    resultType: 'Result Type',
    result: 'Result / GPA',
    
    // Delete Confirmation
    deleteConfirm: 'Delete this entry?',
    confirmYes: 'Delete',
    confirmNo: 'Cancel',
    
    // Experience
    workExperience: 'Work Experience',
    addExperience: 'Add Work Experience',
    fresherNote: 'Freshers can leave this empty; the CV will automatically optimize spacing for projects and training.',
    company: 'Organization / Company',
    role: 'Designation / Role',
    responsibilities: 'Key Responsibilities (bullet lines)',
    
    // Training
    training: 'Training & Courses',
    addTraining: 'Add Training / Course',
    trainingTitle: 'Course / Training Title',
    duration: 'Duration',
    
    // Projects
    projects: 'Academic & Personal Projects',
    addProject: 'Add Project',
    projectTitle: 'Project Name',
    toolsUsed: 'Technologies / Tools Used',
    projectLink: 'Live / GitHub Link',
    
    // Skills
    skills: 'Skills',
    addSkillCategory: 'Add Skill Category',
    categoryName: 'Category Name (e.g. Technical Skills, Soft Skills)',
    skillItems: 'Skills (e.g. React, Node.js, Python, Figma)',
    
    // Honors
    honors: 'Honors & Awards',
    addHonor: 'Add Award',
    
    // Certifications
    certifications: 'Certifications',
    addCertification: 'Add Certification',
    
    // Activities
    activities: 'Extracurricular Activities',
    addActivity: 'Add Activity',
    
    // References
    references: 'References',
    addReference: 'Add Reference',
    refName: 'Referee Name',
    designation: 'Designation',
    organization: 'Organization / Institute',
    
    // Interests
    interests: 'Interests & Hobbies',
    
    // Cropper Modal
    cropTitle: 'Crop & Adjust Profile Photo',
    cropDesc: 'Adjust photo to standard passport aspect ratio with studio white background.',
    aspect34: '3:4 (Passport/CV)',
    aspect11: '1:1 (Square)',
    zoom: 'Zoom',
    rotate: 'Rotate',
    saveCrop: 'Crop & Apply',
    cancel: 'Cancel',
    autoWhiteBg: 'Auto White Background',
    whiteBgDesc: 'Replace background with clean studio pure white',
  },
  bn: {
    appName: 'সিভি মেকার',
    tagline: 'প্রফেশনাল জীবনবৃত্তান্ত প্রস্তুতকারক',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    generatingPdf: 'পিডিএফ তৈরি হচ্ছে...',
    printPdf: 'প্রিন্ট / সেভ করুন',
    fitOnePage: '১ পৃষ্ঠায় মানানসই করুন',
    fitOnePageActive: '১ পৃষ্ঠা মোড সক্রিয়',
    clearAllData: 'সব তথ্য মুছুন',
    clearConfirm: 'আপনি কি নিশ্চিত যে সমস্ত তথ্য মুছে ফাঁকা টেমপ্লেট দিয়ে শুরু করতে চান?',
    resetSample: 'নমুনা তথ্য লোড',
    resetConfirm: 'বাস্তবধর্মী নমুনা তথ্য দিয়ে সিভি পূরণ করবেন?',
    installApp: 'অ্যাপ ইনস্টল',
    installed: 'ইনস্টলড',
    editor: 'এডিটর',
    preview: 'প্রিভিউ',
    themeColor: 'থিম কালার',
    livePreviewTitle: 'লাইভ A4 প্রিভিউ',
    realTimeSync: 'রিয়েল-টাইম আপডেট',
    offlineNotice: 'অফলাইন মোড · আপনার তথ্য ডিভাইসে সংরক্ষিত',
    
    // Personal Details
    personalInfo: 'ব্যক্তিগত তথ্য',
    photoUpload: 'ছবি আপলোড',
    removePhoto: 'ছবি মুছুন',
    showPhoto: 'সিভিতে ছবি দেখান',
    photoReq: 'সর্বোচ্চ ৫ মেগাবাইট (JPG/PNG)। ৩:৪ পাসপোর্ট ক্রপ ও অটো সাদা ব্যাকগ্রাউন্ড সুবিধাসহ।',
    fullName: 'পূর্ণ নাম',
    jobTitle: 'পদবি / পেশা',
    email: 'ইমেইল',
    phone: 'মোবাইল নম্বর',
    website: 'পোর্টফোলিও / লিঙ্কডইন / ওয়েবসাইট',
    birthDate: 'জন্ম তারিখ',
    gender: 'লিঙ্গ',
    
    // Accounts & Social Profiles (Optional)
    accountsTitle: 'অনলাইন অ্যাকাউন্ট ও সোশ্যাল প্রোফাইল',
    accountsSubtitle: 'লিঙ্কডইন, গিটহাব, ইন্সটাগ্রাম, ফেসবুক, এক্স, পোর্টফোলিও ইত্যাদি (সম্পূর্ণ ঐচ্ছিক)',
    addAccount: 'অ্যাকাউন্ট যোগ করুন',
    accountName: 'অ্যাকাউন্ট নাম / প্ল্যাটফর্ম',
    accountLinkOrHandle: 'ইউজারনেম বা প্রোফাইল লিংক',
    customAccountName: 'প্ল্যাটফর্মের নাম (যেমন Behance, Medium)',
    optionalBadge: 'ঐচ্ছিক',
    noAccountsYet: 'কোনো অনলাইন অ্যাকাউন্ট যোগ করা হয়নি। প্রোফাইল লিংক যোগ করতে "+ অ্যাকাউন্ট যোগ করুন"-এ চাপুন অথবা ফাঁকা রাখুন।',
    
    // Address
    presentAddress: 'বর্তমান ঠিকানা',
    permanentAddress: 'স্থায়ী ঠিকানা',
    sameAsPresent: 'বর্তমান ঠিকানার অনুরূপ',
    country: 'দেশ',
    division: 'বিভাগ / রাজ্য',
    district: 'জেলা',
    thana: 'থানা / উপজেলা / শহর',
    streetLine: 'বাড়ি, রোড, গ্রাম, পোস্ট কোড (ঐচ্ছিক লাইন)',
    selectCountryFirst: 'প্রথমে একটি দেশ নির্বাচন করুন',
    
    // Objective
    objective: 'ক্যারিয়ার অবজেক্টিভ',
    objectivePlaceholder: 'আপনার ক্যারিয়ারের লক্ষ্য ও দক্ষতা সংক্ষেপে তুলে ধরুন...',
    
    // Education
    education: 'শিক্ষাগত যোগ্যতা',
    addEducation: 'শিক্ষা যোগ করুন',
    level: 'শিক্ষাগত স্তর',
    institution: 'প্রতিষ্ঠান / বিশ্ববিদ্যালয়',
    institutionPlaceholder: 'বিশ্ববিদ্যালয় নির্বাচন করুন অথবা নাম লিখুন...',
    board: 'শিক্ষা বোর্ড',
    group: 'বিভাগ / গ্রুপ',
    department: 'কোর্স / বিভাগ',
    departmentPlaceholder: 'খুঁজতে লিখুন (যেমনঃ c দিলে CSE, s দিলে Software)...',
    college: 'কলেজের নাম',
    school: 'স্কুলের নাম',
    passingYear: 'পাসের সন',
    cgpaVarsity: 'সিজিপিএ (CGPA)',
    resultType: 'ফলাফলের ধরন',
    result: 'ফলাফল / জিপিএ',
    
    // Delete Confirmation
    deleteConfirm: 'মুছে ফেলতে চান?',
    confirmYes: 'মুছুন',
    confirmNo: 'বাতিল',
    
    // Experience
    workExperience: 'কাজের অভিজ্ঞতা',
    addExperience: 'অভিজ্ঞতা যোগ করুন',
    fresherNote: 'নতুন গ্র্যাজুয়েট বা ফ্রেশারদের জন্য এটি ফাঁকা রাখা যাবে; সিভি স্বয়ংক্রিয়ভাবে প্রজেক্ট ও ট্রেনিংকে প্রাধান্য দেবে।',
    company: 'কোম্পানি / প্রতিষ্ঠান',
    role: 'পদবি',
    responsibilities: 'দায়িত্ব ও অর্জনসমূহ (বুলেট আকারে)',
    
    // Training
    training: 'প্রশিক্ষণ ও কোর্স',
    addTraining: 'প্রশিক্ষণ যোগ করুন',
    trainingTitle: 'কোর্স / প্রশিক্ষণের নাম',
    duration: 'মেয়াদ',
    
    // Projects
    projects: 'একাডেমিক ও ব্যক্তিগত প্রজেক্ট',
    addProject: 'প্রজেক্ট যোগ করুন',
    projectTitle: 'প্রজেক্টের নাম',
    toolsUsed: 'ব্যবহৃত প্রযুক্তি / টুলস',
    projectLink: 'লাইভ / গিটহাব লিংক',
    
    // Skills
    skills: 'দক্ষতা',
    addSkillCategory: 'দক্ষতার ক্যাটাগরি যোগ করুন',
    categoryName: 'ক্যাটাগরি (যেমনঃ টেকনিক্যাল স্কিল, ভাষা)',
    skillItems: 'দক্ষতাসমূহ (যেমনঃ React, Python, Office)',
    
    // Honors
    honors: 'পুরস্কার ও সম্মাননা',
    addHonor: 'পুরস্কার যোগ করুন',
    
    // Certifications
    certifications: 'সনদপত্র / সার্টিফিকেট',
    addCertification: 'সার্টিফিকেট যোগ করুন',
    
    // Activities
    activities: 'সহ-শিক্ষা কার্যক্রম',
    addActivity: 'কার্যক্রম যোগ করুন',
    
    // References
    references: 'রেফারেন্স',
    addReference: 'রেফারেন্স যোগ করুন',
    refName: 'ব্যক্তির নাম',
    designation: 'পদবি',
    organization: 'প্রতিষ্ঠান',
    
    // Interests
    interests: 'আগ্রহ ও শখ',
    
    // Cropper Modal
    cropTitle: 'ছবি ক্রপ ও রিসাইজ করুন',
    cropDesc: 'আপনার ছবিটি ৩:৪ পাসপোর্ট বা ১:১ অনুপাতে নিখুঁত সাদা ব্যাকগ্রাউন্ডে সাজান।',
    aspect34: '৩:৪ (পাসপোর্ট / সিভি)',
    aspect11: '১:১ (বর্গাকার)',
    zoom: 'জুম',
    rotate: 'ঘোরান',
    saveCrop: 'ক্রপ সম্পন্ন করুন',
    cancel: 'বাতিল',
    autoWhiteBg: 'অটো হোয়াইট ব্যাকগ্রাউন্ড',
    whiteBgDesc: 'ছবির ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে বিশুদ্ধ সাদা করবে',
  },
};
