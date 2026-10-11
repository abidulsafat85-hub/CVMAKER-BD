import React, { useState, useEffect, useRef } from 'react';
import {
  CVData,
  EducationItem,
  EducationLevel,
  WorkExperienceItem,
  TrainingItem,
  ProjectItem,
  ReferenceItem,
  ActivityItem,
  SkillCategory,
  HonorAwardItem,
  CertificationItem,
  BANGLADESH_EDUCATION_BOARDS,
  BANGLADESH_EDUCATION_GROUPS,
} from '../../types/cv';
import { CascadingAddressPicker } from '../CascadingAddressPicker';

let cachedUniversitiesMod: typeof import('../../data/bdUniversities') | null = null;
let cachedInstitutionsMod: typeof import('../../data/bdInstitutions') | null = null;
import { Language, TRANSLATIONS } from '../../data/translations';
import {
  User,
  GraduationCap,
  Briefcase,
  BriefcaseBusiness,
  Award,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Upload,
  Palette,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FolderGit2,
  FolderKanban,
  Users2,
  Users,
  X,
  Check,
  Globe,
  ImagePlus,
  Target,
  Wrench,
  Trophy,
  ContactRound,
} from 'lucide-react';

interface CVEditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
  onRequestCrop: (rawImageSrc: string) => void;
  lang: Language;
}

const CVEditorComponent: React.FC<CVEditorProps> = ({
  data,
  onChange,
  onRequestCrop,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [uniMod, setUniMod] = useState(() => cachedUniversitiesMod);
  const [instMod, setInstMod] = useState(() => cachedInstitutionsMod);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // On mobile (< 768px), keep only Personal Information open initially so user is not overwhelmed
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      return {
        personal: true,
        education: false,
        projects: false,
        skills: false,
        work: false,
        training: false,
        references: false,
        more: false,
        objective: false,
      };
    }
    return {
      personal: true,
      education: true,
      projects: true,
      skills: true,
      work: true,
      training: false,
      references: false,
      more: false,
      objective: false,
    };
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{ id: string; type: 'inst' | 'dept' } | null>(null);

  // References to section elements and scroll container to smoothly center into middle of screen
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSectionOpen = (key: string) => !!openSections[key];

  useEffect(() => {
    if (openSections.education) {
      if (!cachedUniversitiesMod) {
        import('../../data/bdUniversities').then((mod) => {
          cachedUniversitiesMod = mod;
          setUniMod(mod);
        });
      }
      if (!cachedInstitutionsMod) {
        import('../../data/bdInstitutions').then((mod) => {
          cachedInstitutionsMod = mod;
          setInstMod(mod);
        });
      }
    }
  }, [openSections.education]);

  const popularUniversities = uniMod?.POPULAR_BD_UNIVERSITIES || [];
  const commonDepartments = uniMod?.COMMON_UNIVERSITY_DEPARTMENTS || [];
  const getCourses = uniMod?.getUniversityCourses || (() => []);
  const popularColleges = instMod?.POPULAR_BD_COLLEGES || [];
  const popularSchools = instMod?.POPULAR_BD_SCHOOLS || [];
  const searchInst = instMod?.searchInstitutions || ((_q: string, _l: any[]) => []);

  const jumpToSection = (sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
    setTimeout(() => {
      const el = sectionRefs.current[sectionKey];
      const container = containerRef.current;
      if (el && container) {
        const offsetTop = el.offsetTop - container.offsetTop;
        const targetScroll = Math.max(0, offsetTop - Math.round(container.clientHeight * 0.15));
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }, 70);
  };

  const toggleSection = (sectionKey: string) => {
    const willOpen = !openSections[sectionKey];
    setOpenSections((prev) => ({ ...prev, [sectionKey]: willOpen }));

    if (willOpen) {
      setTimeout(() => {
        const el = sectionRefs.current[sectionKey];
        const container = containerRef.current;
        if (el && container) {
          const offsetTop = el.offsetTop - container.offsetTop;
          const targetScroll = Math.max(0, offsetTop - Math.round(container.clientHeight * 0.15));
          container.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
        }
      }, 70);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Helper to ask confirmation before deleting any item
  const confirmAndDelete = (id: string, deleteFn: () => void) => {
    if (deleteConfirmId === id) {
      deleteFn();
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Auto reset confirm state after 5 seconds if no response
      setTimeout(() => {
        setDeleteConfirmId((curr) => (curr === id ? null : curr));
      }, 5000);
    }
  };

  // Reusable inline delete button with confirmation (min 40px touch area on mobile)
  const renderDeleteControl = (id: string, deleteFn: () => void) => {
    if (deleteConfirmId === id) {
      return (
        <div className="flex items-center gap-1.5 bg-red-50 py-1 px-2 rounded-xl border border-red-200 animate-in fade-in min-h-[38px]">
          <span className="text-[11px] font-bold text-red-700">
            {lang === 'bn' ? 'মুছবেন?' : 'Delete?'}
          </span>
          <button
            type="button"
            onClick={() => confirmAndDelete(id, deleteFn)}
            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[11px] font-semibold transition cursor-pointer min-h-[32px]"
            title={lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Delete'}
          >
            {lang === 'bn' ? 'হ্যাঁ' : 'Yes'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmId(null)}
            className="px-2 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] transition cursor-pointer min-h-[32px]"
            title={lang === 'bn' ? 'বাতিল' : 'Cancel'}
          >
            <X className="w-3.5 h-3.5 inline" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setDeleteConfirmId(id)}
        className="text-slate-400 hover:text-red-600 p-2 sm:p-1.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl hover:bg-red-50 active:bg-red-100 transition cursor-pointer"
        title={lang === 'bn' ? 'মুছুন' : 'Delete'}
        aria-label={lang === 'bn' ? 'মুছুন' : 'Delete'}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  };

  // Helpers to update personal info
  const updatePersonal = (field: keyof CVData['personal'], value: unknown) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };


  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'bn' ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।' : 'File size must be under 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ছবি ফাইল নির্বাচন করুন।' : 'Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onRequestCrop(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Education Helpers: 1st Honours, 2nd HSC, 3rd SSC
  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      level: 'Honours / Bachelor',
      degreeTitle: 'Bachelor',
      institution: '',
      department: '',
      passingYear: new Date().getFullYear().toString(),
      result: '',
    };
    onChange({ ...data, education: [...data.education, newItem] });
  };

  const updateEducation = (id: string, field: keyof EducationItem, val: unknown) => {
    onChange({
      ...data,
      education: data.education.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((item) => item.id !== id),
    });
  };

  // Work Experience Helpers
  const addWork = () => {
    const newItem: WorkExperienceItem = {
      id: `work-${Date.now()}`,
      company: '',
      role: '',
      startYear: '2023',
      endYear: 'Present',
      description: '- Key responsibility or project contribution\n- Achievement or measurable outcome',
    };
    onChange({ ...data, workExperience: [...data.workExperience, newItem] });
  };

  const updateWork = (id: string, field: keyof WorkExperienceItem, val: string) => {
    onChange({
      ...data,
      workExperience: data.workExperience.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeWork = (id: string) => {
    onChange({
      ...data,
      workExperience: data.workExperience.filter((item) => item.id !== id),
    });
  };

  // Training / Courses Helpers
  const addTraining = () => {
    const newItem: TrainingItem = {
      id: `train-${Date.now()}`,
      title: '',
      institution: '',
      duration: '3 Months',
      description: 'Covered essential hands-on modules and practical projects.',
    };
    onChange({ ...data, trainingCourses: [...data.trainingCourses, newItem] });
  };

  const updateTraining = (id: string, field: keyof TrainingItem, val: string) => {
    onChange({
      ...data,
      trainingCourses: data.trainingCourses.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeTraining = (id: string) => {
    onChange({
      ...data,
      trainingCourses: data.trainingCourses.filter((item) => item.id !== id),
    });
  };

  // Projects Helpers
  const addProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: '',
      tools: '',
      description: '- Built end-to-end features with high test coverage\n- Deployed production release with responsive UI',
      link: '',
    };
    onChange({ ...data, projects: [...data.projects, newItem] });
  };

  const updateProject = (id: string, field: keyof ProjectItem, val: string) => {
    onChange({
      ...data,
      projects: data.projects.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((item) => item.id !== id),
    });
  };

  // Reference Helpers
  const addReference = () => {
    const newItem: ReferenceItem = {
      id: `ref-${Date.now()}`,
      name: '',
      designation: '',
      organization: '',
      phone: '',
      email: '',
    };
    onChange({ ...data, references: [...data.references, newItem] });
  };

  const updateReference = (id: string, field: keyof ReferenceItem, val: string) => {
    onChange({
      ...data,
      references: data.references.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeReference = (id: string) => {
    onChange({
      ...data,
      references: data.references.filter((item) => item.id !== id),
    });
  };

  // Activity Helpers
  const addActivity = () => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      organization: '',
      role: '',
      year: new Date().getFullYear().toString(),
      description: '- Participated in key events',
    };
    onChange({ ...data, activities: [...data.activities, newItem] });
  };

  const updateActivity = (id: string, field: keyof ActivityItem, val: string) => {
    onChange({
      ...data,
      activities: data.activities.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeActivity = (id: string) => {
    onChange({
      ...data,
      activities: data.activities.filter((item) => item.id !== id),
    });
  };

  // Skills Helpers
  const addSkill = () => {
    const newItem: SkillCategory = {
      id: `skill-${Date.now()}`,
      name: 'Technical Skills',
      items: 'JavaScript, React, Python',
    };
    onChange({ ...data, skillCategories: [...data.skillCategories, newItem] });
  };

  const updateSkill = (id: string, field: keyof SkillCategory, val: string) => {
    onChange({
      ...data,
      skillCategories: data.skillCategories.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeSkill = (id: string) => {
    onChange({
      ...data,
      skillCategories: data.skillCategories.filter((item) => item.id !== id),
    });
  };

  // Honors Helpers
  const addHonor = () => {
    const newItem: HonorAwardItem = {
      id: `honor-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: "Dean's Honor Award",
      description: 'Academic Excellence Award',
    };
    onChange({ ...data, honorsAwards: [...data.honorsAwards, newItem] });
  };

  const updateHonor = (id: string, field: keyof HonorAwardItem, val: string) => {
    onChange({
      ...data,
      honorsAwards: data.honorsAwards.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeHonor = (id: string) => {
    onChange({
      ...data,
      honorsAwards: data.honorsAwards.filter((item) => item.id !== id),
    });
  };

  // Certifications Helpers
  const addCert = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: 'Professional Certificate',
      issuer: 'Institute / Authority',
    };
    onChange({ ...data, certifications: [...data.certifications, newItem] });
  };

  const updateCert = (id: string, field: keyof CertificationItem, val: string) => {
    onChange({
      ...data,
      certifications: data.certifications.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    });
  };

  const removeCert = (id: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter((item) => item.id !== id),
    });
  };

  const COLOR_PALETTES = [
    { label: 'Signature Teal', hex: '#389ba8' },
    { label: 'Deep Emerald', hex: '#0d9488' },
    { label: 'Sky Ocean', hex: '#0284c7' },
    { label: 'Royal Indigo', hex: '#4f46e5' },
    { label: 'Classic Forest', hex: '#059669' },
    { label: 'Slate Executive', hex: '#334155' },
    { label: 'Crimson Burgundy', hex: '#be123c' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full text-slate-800">
      {/* Theme Accent Color Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t.themeColor}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.hex}
              type="button"
              onClick={() => onChange({ ...data, themeColor: palette.hex })}
              title={palette.label}
              className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative ${
                data.themeColor === palette.hex
                  ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-xs'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              }`}
              style={{ backgroundColor: palette.hex }}
            />
          ))}
        </div>
      </div>

      {/* Quick Navigation Tabs for instant centering */}
      <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'personal', label: lang === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal' },
          { id: 'education', label: lang === 'bn' ? 'শিক্ষা (Education)' : 'Education' },
          { id: 'projects', label: lang === 'bn' ? 'প্রজেক্ট (Projects)' : 'Projects' },
          { id: 'skills', label: lang === 'bn' ? 'দক্ষতা (Skills)' : 'Skills' },
          { id: 'work', label: lang === 'bn' ? 'অভিজ্ঞতা (Work)' : 'Experience' },
          { id: 'training', label: lang === 'bn' ? 'ট্রেনিং (Training)' : 'Training' },
          { id: 'references', label: lang === 'bn' ? 'রেফারেন্স (References)' : 'References' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => jumpToSection(tab.id)}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition text-[11px] cursor-pointer ${
              openSections[tab.id]
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion / Scrollable form panels */}
      <div ref={containerRef} className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
        {/* ================= 1. PERSONAL INFORMATION (Zero Bangladesh Personal Details) ================= */}
        <div
          ref={(el) => { sectionRefs.current['personal'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('personal')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>{t.personalInfo}</span>
            </div>
            {isSectionOpen('personal') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('personal') && (
            <div className="p-4 space-y-4 bg-white border-t border-slate-100 text-xs">
              {/* Photo Upload with 3:4 Cropper, High-Res Zoom & Auto White Background */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                {data.personal.avatarUrl ? (
                  <div className="relative group shrink-0">
                    <img
                      src={data.personal.avatarUrl}
                      alt="Candidate"
                      className="w-16 h-20 rounded-lg object-cover border border-slate-300 shadow-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => updatePersonal('avatarUrl', '')}
                      title={t.removePhoto}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-xs cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                    <User className="w-6 h-6 stroke-1 mb-1" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Photo</span>
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold cursor-pointer shadow-2xs transition">
                      <ImagePlus className="w-4 h-4 shrink-0" />
                      <span>{data.personal.avatarUrl ? (lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo') : t.photoUpload}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handlePhotoUploadChange}
                        className="hidden"
                      />
                    </label>

                    {data.personal.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => updatePersonal('avatarUrl', '')}
                        className="px-3 py-2 min-h-[38px] rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-medium transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.removePhoto}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    {t.photoReq}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.personal.showAvatar}
                        onChange={(e) => updatePersonal('showAvatar', e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-[11px]">{t.showPhoto}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Full Name & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.fullName} *</label>
                  <input
                    type="text"
                    value={data.personal.fullName}
                    onChange={(e) => updatePersonal('fullName', e.target.value)}
                    placeholder="e.g. ABIDUL ISLAM SAFAT"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.jobTitle} *</label>
                  <input
                    type="text"
                    value={data.personal.jobTitle}
                    onChange={(e) => updatePersonal('jobTitle', e.target.value)}
                    placeholder="e.g. SOFTWARE ENGINEER"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden text-sm"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.phone} *</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={data.personal.phone}
                    onChange={(e) => updatePersonal('phone', e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.email} *</label>
                  <input
                    type="email"
                    value={data.personal.email}
                    onChange={(e) => updatePersonal('email', e.target.value)}
                    placeholder="safat@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Optional Website / Portfolio / LinkedIn */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between text-xs">
                  <span>{t.website}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'bn' ? '(ঐচ্ছিক)' : '(Optional)'}
                  </span>
                </label>
                <input
                  type="text"
                  value={data.personal.website}
                  onChange={(e) => updatePersonal('website', e.target.value)}
                  placeholder="e.g. linkedin.com/in/username or portfolio.dev"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden text-xs"
                />
              </div>

              {/* Date of Birth & Gender (Strictly English in English mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.birthDate}</label>
                  <input
                    type="text"
                    value={data.personal.birthDate}
                    onChange={(e) => updatePersonal('birthDate', e.target.value)}
                    placeholder="e.g. 15 October 1999"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.gender}</label>
                  <select
                    value={data.personal.gender}
                    onChange={(e) => updatePersonal('gender', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden bg-white text-xs font-medium"
                  >
                    <option value="Male">{lang === 'bn' ? 'পুরুষ' : 'Male'}</option>
                    <option value="Female">{lang === 'bn' ? 'মহিলা' : 'Female'}</option>
                    <option value="Other">{lang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>
              </div>

              {/* Cascading Address Pickers: Present & Permanent Address */}
              <div className="space-y-4 pt-1">
                {/* 1. Present Address */}
                <CascadingAddressPicker
                  label={t.presentAddress}
                  value={data.personal.presentAddress}
                  onChange={(addr) => {
                    const updatedPersonal = {
                      ...data.personal,
                      presentAddress: addr,
                    };
                    if (data.personal.sameAsPresentAddress) {
                      updatedPersonal.permanentAddress = addr;
                    }
                    onChange({ ...data, personal: updatedPersonal });
                  }}
                  lang={lang}
                />

                {/* Same as Present Address Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!data.personal.sameAsPresentAddress}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const updatedPersonal = {
                          ...data.personal,
                          sameAsPresentAddress: checked,
                          permanentAddress: checked
                            ? { ...data.personal.presentAddress }
                            : { ...data.personal.permanentAddress },
                        };
                        onChange({ ...data, personal: updatedPersonal });
                      }}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {t.sameAsPresent}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {lang === 'bn'
                          ? 'বর্তমান ও স্থায়ী ঠিকানা একই হলে টিক দিন, অন্যথায় নিচে স্থায়ী ঠিকানা দিন'
                          : 'Check if present and permanent addresses are identical'}
                      </span>
                    </div>
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    data.personal.sameAsPresentAddress
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {data.personal.sameAsPresentAddress
                      ? (lang === 'bn' ? 'একই ঠিকানা' : 'Identical')
                      : (lang === 'bn' ? 'আলাদা ঠিকানা' : 'Different')}
                  </span>
                </div>

                {/* 2. Permanent Address (Displayed when NOT same as present address) */}
                {!data.personal.sameAsPresentAddress && (
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2 animate-in fade-in">
                    <CascadingAddressPicker
                      label={t.permanentAddress}
                      value={data.personal.permanentAddress}
                      onChange={(addr) => {
                        onChange({
                          ...data,
                          personal: {
                            ...data.personal,
                            permanentAddress: addr,
                          },
                        });
                      }}
                      lang={lang}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. CAREER OBJECTIVE ================= */}
        <div
          ref={(el) => { sectionRefs.current['objective'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('objective')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Target className="w-4 h-4 text-teal-600" />
              <span>{t.objective}</span>
            </div>
            {isSectionOpen('objective') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('objective') && (
            <div className="p-4 space-y-2 bg-white border-t border-slate-100 text-xs">
              <textarea
                rows={3}
                value={data.objective}
                onChange={(e) => onChange({ ...data, objective: e.target.value })}
                placeholder={t.objectivePlaceholder}
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden leading-relaxed text-sm"
              />
            </div>
          )}
        </div>

        {/* ================= 3. EDUCATIONAL QUALIFICATIONS ================= */}
        {/* Ordered: 1st Honours/Bachelor, 2nd HSC/A-Level/Alim/Diploma, 3rd SSC/O-Level/Dakhil */}
        <div
          ref={(el) => { sectionRefs.current['education'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('education')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <span>{t.education} ({data.education.length})</span>
            </div>
            {isSectionOpen('education') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('education') && (
            <div className="p-4 space-y-4 bg-white border-t border-slate-100 text-xs">
              {/* Datalist for Popular BD Universities */}
              <datalist id="bd-university-datalist">
                {popularUniversities.slice(0, 45).map((uni) => (
                  <option key={uni.en} value={uni.en} />
                ))}
              </datalist>

              {data.education.map((edu, index) => {
                const isVarsity =
                  edu.level === 'Honours / Bachelor' ||
                  edu.level === 'Masters' ||
                  edu.level === 'PhD';

                const isSscOrHsc =
                  edu.level === 'SSC / O-Level / Dakhil' ||
                  edu.level === 'HSC / A-Level / Alim / Diploma';

                // Real course lookup for selected university
                const availableUniCourses = getCourses(edu.institution);

                return (
                  <div
                    key={edu.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-teal-600" />
                        <span>#{index + 1} {edu.degreeTitle || (edu.level === 'Honours / Bachelor' ? 'Bachelor' : edu.level === 'HSC / A-Level / Alim / Diploma' ? 'HSC' : edu.level === 'SSC / O-Level / Dakhil' ? 'SSC' : edu.level)}</span>
                      </span>

                      {/* Clean Delete Icon with Confirmation */}
                      {renderDeleteControl(edu.id, () => removeEducation(edu.id))}
                    </div>

                    {/* Level Selector: 1. Honours / Bachelor, 2. HSC / A-Level / Alim / Diploma, 3. SSC / O-Level / Dakhil */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">{t.level} *</label>
                        <select
                          value={edu.level}
                          onChange={(e) => {
                            const newLevel = e.target.value as EducationLevel;
                            let defaultTitle = 'Bachelor';
                            if (newLevel === 'Honours / Bachelor') defaultTitle = 'Bachelor';
                            else if (newLevel === 'HSC / A-Level / Alim / Diploma') defaultTitle = 'HSC';
                            else if (newLevel === 'SSC / O-Level / Dakhil') defaultTitle = 'SSC';
                            else if (newLevel === 'Masters') defaultTitle = 'Masters';
                            else if (newLevel === 'PhD') defaultTitle = 'PhD';
                            else defaultTitle = 'Other';

                            onChange({
                              ...data,
                              education: data.education.map((item) =>
                                item.id === edu.id ? { ...item, level: newLevel, degreeTitle: defaultTitle } : item
                              ),
                            });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                        >
                          <option value="Honours / Bachelor">
                            {lang === 'bn' ? '১. স্নাতক / অনার্স (Honours / Bachelor)' : '1. Honours / Bachelor'}
                          </option>
                          <option value="HSC / A-Level / Alim / Diploma">
                            {lang === 'bn' ? '২. এইচএসসি / কলেজ (HSC / College / Diploma)' : '2. HSC / College / Diploma'}
                          </option>
                          <option value="SSC / O-Level / Dakhil">
                            {lang === 'bn' ? '৩. এসএসসি / স্কুল (SSC / School / Dakhil)' : '3. SSC / School / Dakhil'}
                          </option>
                          <option value="Masters">
                            {lang === 'bn' ? 'মাস্টার্স (Masters)' : 'Masters'}
                          </option>
                          <option value="PhD">
                            {lang === 'bn' ? 'পিএইচডি (PhD)' : 'PhD'}
                          </option>
                          <option value="Other">
                            {lang === 'bn' ? 'অন্যান্য (Other)' : 'Other'}
                          </option>
                        </select>
                      </div>

                      {/* Institution Input with smart autocomplete (University / College / School) */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700 text-xs">
                            {isVarsity
                              ? (lang === 'bn' ? 'বিশ্ববিদ্যালয়ের নাম *' : 'University Name *')
                              : edu.level === 'HSC / A-Level / Alim / Diploma'
                              ? (edu.degreeTitle === 'Diploma'
                                  ? (lang === 'bn' ? 'পলিটেকনিক / ইনস্টিটিউটের নাম *' : 'Polytechnic / Institute Name *')
                                  : edu.degreeTitle === 'Alim'
                                  ? (lang === 'bn' ? 'মাদ্রাসার নাম *' : 'Madrasah Name *')
                                  : (lang === 'bn' ? 'কলেজের নাম *' : 'College Name *'))
                              : edu.level === 'SSC / O-Level / Dakhil'
                              ? (edu.degreeTitle === 'Dakhil'
                                  ? (lang === 'bn' ? 'মাদ্রাসার নাম *' : 'Madrasah Name *')
                                  : (lang === 'bn' ? 'স্কুলের নাম *' : 'School Name *'))
                              : (lang === 'bn' ? 'প্রতিষ্ঠানের নাম *' : 'Institution Name *')}
                          </label>
                        </div>
                        <input
                          type="text"
                          value={edu.institution}
                          onFocus={() => {
                            if (edu.institution && edu.institution.trim().length > 0) {
                              setOpenDropdown({ id: edu.id, type: 'inst' });
                            } else {
                              setOpenDropdown(null);
                            }
                          }}
                          onChange={(e) => {
                            updateEducation(edu.id, 'institution', e.target.value);
                            if (e.target.value.trim().length > 0) {
                              setOpenDropdown({ id: edu.id, type: 'inst' });
                            } else {
                              setOpenDropdown(null);
                            }
                          }}
                          placeholder={
                            isVarsity
                              ? 'e.g. DIU, BUET, DU, University of Dhaka...'
                              : edu.level === 'HSC / A-Level / Alim / Diploma'
                              ? 'e.g. DC, NDC, Dhaka Commerce College, City College...'
                              : edu.level === 'SSC / O-Level / Dakhil'
                              ? 'e.g. Ideal School, Government Muslim High School...'
                              : 'Institution name...'
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                        />

                        {/* Dropdown suggestions for Institutions (ONLY show when user writes first word/character) */}
                        {openDropdown?.id === edu.id && openDropdown?.type === 'inst' && (() => {
                          const query = (edu.institution || '').trim().toLowerCase();
                          if (!query || query.length === 0) return null;

                          let suggestions: { name: string; short?: string; city?: string; isPrivate?: boolean }[] = [];

                          if (isVarsity) {
                            suggestions = popularUniversities.filter((u) => {
                              const n = u.en.toLowerCase();
                              const s = u.shortName?.toLowerCase() || '';
                              return n.includes(query) || s === query || s.startsWith(query);
                            }).map((u) => ({ name: u.en, short: u.shortName }));
                          } else if (edu.level === 'HSC / A-Level / Alim / Diploma') {
                            suggestions = searchInst(query, popularColleges);
                          } else if (edu.level === 'SSC / O-Level / Dakhil') {
                            suggestions = searchInst(query, popularSchools);
                          }

                          return suggestions.length > 0 ? (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                              {suggestions.slice(0, 35).map((item) => (
                                <button
                                  key={item.name}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    updateEducation(edu.id, 'institution', item.name);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 hover:text-teal-900 transition flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-semibold text-slate-800">{item.name}</span>
                                    {item.city && (
                                      <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                                        ({item.city})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {item.isPrivate && (
                                      <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200">
                                        Private
                                      </span>
                                    )}
                                    {item.short && (
                                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                        {item.short}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Specific Degree Selection: Honours vs Bachelor, HSC vs A-Level vs Alim vs Diploma, etc. */}
                    {edu.level === 'Honours / Bachelor' && (
                      <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200">
                        <label className="block font-bold text-teal-900 mb-2 text-xs">
                          {lang === 'bn'
                            ? 'Honours নাকি Bachelor? (আপনার ডিগ্রি সিলেক্ট করুন):'
                            : 'Honours or Bachelor? (Select your degree):'} *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'Bachelor', label: '🎓 Bachelor (ব্যাচেলর)' },
                            { value: 'Honours', label: '🎓 Honours (অনার্স)' },
                          ].map((opt) => {
                            const isSelected = (edu.degreeTitle || 'Bachelor') === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateEducation(edu.id, 'degreeTitle', opt.value)}
                                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                                }`}
                              >
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {edu.level === 'HSC / A-Level / Alim / Diploma' && (
                      <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200">
                        <label className="block font-bold text-teal-900 mb-2 text-xs">
                          {lang === 'bn'
                            ? 'কলেজের পরীক্ষা / ডিগ্রি সিলেক্ট করুন:'
                            : 'Select College Examination / Degree:'} *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { value: 'HSC', label: '🎓 HSC (এইচএসসি)' },
                            { value: 'A-Level', label: '🎓 A-Level (এ-লেভেল)' },
                            { value: 'Alim', label: '🎓 Alim (আলিম)' },
                            { value: 'Diploma', label: '🎓 Diploma (ডিপ্লোমা)' },
                          ].map((opt) => {
                            const isSelected = (edu.degreeTitle || 'HSC') === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateEducation(edu.id, 'degreeTitle', opt.value)}
                                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                                }`}
                              >
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {edu.level === 'SSC / O-Level / Dakhil' && (
                      <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200">
                        <label className="block font-bold text-teal-900 mb-2 text-xs">
                          {lang === 'bn'
                            ? 'স্কুলের পরীক্ষা / ডিগ্রি সিলেক্ট করুন:'
                            : 'Select School Examination:'} *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'SSC', label: '🎓 SSC (এসএসসি)' },
                            { value: 'O-Level', label: '🎓 O-Level (ও-লেভেল)' },
                            { value: 'Dakhil', label: '🎓 Dakhil (দাখিল)' },
                          ].map((opt) => {
                            const isSelected = (edu.degreeTitle || 'SSC') === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateEducation(edu.id, 'degreeTitle', opt.value)}
                                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                                }`}
                              >
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {edu.level === 'Masters' && (
                      <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200">
                        <label className="block font-bold text-teal-900 mb-2 text-xs">
                          {lang === 'bn'
                            ? 'স্নাতকোত্তর ডিগ্রি সিলেক্ট করুন:'
                            : 'Select Masters Degree:'} *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { value: 'Masters', label: '🎓 Masters (মাস্টার্স)' },
                            { value: 'MSc', label: '🎓 MSc' },
                            { value: 'MBA', label: '🎓 MBA' },
                            { value: 'MA', label: '🎓 MA' },
                          ].map((opt) => {
                            const isSelected = (edu.degreeTitle || 'Masters') === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateEducation(edu.id, 'degreeTitle', opt.value)}
                                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                                  isSelected
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                                }`}
                              >
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Varsity Course / Department Input with instant type-to-search dropdown */}
                    {isVarsity && (() => {
                      const uniCourses = getCourses(edu.institution);
                      const allCatalog = Array.from(new Set([...uniCourses, ...commonDepartments]));
                      const q = (edu.department || '').trim().toLowerCase();
                      const matchedList = allCatalog.filter((c) => {
                        if (!q) return false;
                        const cLower = c.toLowerCase();
                        const words = cLower.split(/[\s(&/,-]+/);
                        return cLower.includes(q) || words.some((w) => w.startsWith(q));
                      });

                      return (
                        <div className="relative">
                          <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t.department} *</span>
                            </span>
                            {edu.department && (
                              <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[220px]">
                                {edu.department}
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            value={edu.department || ''}
                            onFocus={() => {
                              if (edu.department && edu.department.trim().length > 0) {
                                setOpenDropdown({ id: edu.id, type: 'dept' });
                              } else {
                                setOpenDropdown(null);
                              }
                            }}
                            onChange={(e) => {
                              updateEducation(edu.id, 'department', e.target.value);
                              if (e.target.value.trim().length > 0) {
                                setOpenDropdown({ id: edu.id, type: 'dept' });
                              } else {
                                setOpenDropdown(null);
                              }
                            }}
                            placeholder={t.departmentPlaceholder}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                          />

                          {/* Autocomplete popup as user types (only when user writes first word/character) */}
                          {openDropdown?.id === edu.id && openDropdown?.type === 'dept' && q.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                              {matchedList.length > 0 ? (
                                matchedList.slice(0, 35).map((course) => (
                                  <button
                                    key={course}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      updateEducation(edu.id, 'department', course);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 hover:text-teal-900 transition flex items-center justify-between cursor-pointer"
                                  >
                                    <span className="font-medium text-slate-800">{course}</span>
                                    {edu.department === course && (
                                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2.5 text-xs text-slate-500 italic">
                                  Keep typing your custom department.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Board & Group (Only for SSC / HSC levels) */}
                    {isSscOrHsc && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">{t.board} *</label>
                          <select
                            value={edu.board || 'Dhaka'}
                            onChange={(e) => updateEducation(edu.id, 'board', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          >
                            {BANGLADESH_EDUCATION_BOARDS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">{t.group} *</label>
                          <select
                            value={edu.group || 'Science'}
                            onChange={(e) => updateEducation(edu.id, 'group', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          >
                            {BANGLADESH_EDUCATION_GROUPS.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Result Fields: For Varsity, STRICTLY CGPA ONLY */}
                    {isVarsity ? (
                      <div className="grid grid-cols-2 gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">{t.passingYear} *</label>
                          <input
                            type="text"
                            value={edu.passingYear}
                            onChange={(e) => updateEducation(edu.id, 'passingYear', e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            {lang === 'bn' ? 'সিজিপিএ (CGPA) *' : 'CGPA *'}
                          </label>
                          <input
                            type="text"
                            value={edu.result}
                            onChange={(e) => updateEducation(edu.id, 'result', e.target.value)}
                            placeholder="e.g. 3.82"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                          />
                        </div>
                      </div>
                    ) : (
                      /* For School / College (SSC / HSC): Passing Year, GPA (with optional All Subject A+) (NO ROLL NUMBER) */
                      <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">{t.passingYear} *</label>
                            <input
                              type="text"
                              value={edu.passingYear}
                              onChange={(e) => updateEducation(edu.id, 'passingYear', e.target.value)}
                              placeholder="e.g. 2019"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              {lang === 'bn' ? 'জিপিএ (GPA) *' : 'GPA *'}
                            </label>
                            <input
                              type="text"
                              value={edu.result}
                              onChange={(e) => updateEducation(edu.id, 'result', e.target.value)}
                              placeholder="e.g. 5.00"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-teal-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
                            />
                          </div>
                        </div>

                        {/* When GPA is 5.0 / 5.00 / 5, show "All Subject A+" selector */}
                        {(() => {
                          const resStr = (edu.result || '').trim();
                          const isGpa5 = resStr === '5' || resStr === '5.0' || resStr === '5.00' || parseFloat(resStr) === 5;
                          if (!isGpa5) return null;

                          return (
                            <div className="mt-1.5 p-2 bg-amber-50/90 rounded-lg border border-amber-200 flex items-center justify-between text-xs animate-in fade-in">
                              <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
                                <input
                                  type="checkbox"
                                  checked={!!edu.allSubjectAplus}
                                  onChange={(e) => updateEducation(edu.id, 'allSubjectAplus', e.target.checked)}
                                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                                />
                                <span>All Subject A+</span>
                              </label>
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                                Output: {edu.result || '5.0'}{edu.allSubjectAplus ? ' (All Subject A+)' : ''}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addEducation}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addEducation}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 4. WORK EXPERIENCE (Optional / Fresher Friendly) ================= */}
        <div
          ref={(el) => { sectionRefs.current['work'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('work')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BriefcaseBusiness className="w-4 h-4 text-teal-600" />
              <span>{t.workExperience} ({data.workExperience.length})</span>
            </div>
            {isSectionOpen('work') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('work') && (
            <div className="p-4 space-y-4 bg-white border-t border-slate-100 text-xs">
              <p className="text-[11px] text-teal-800 bg-teal-50/80 p-2.5 rounded-lg border border-teal-200/80 leading-relaxed">
                {t.fresherNote}
              </p>

              {data.workExperience.map((work) => (
                <div
                  key={work.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={work.company}
                      onChange={(e) => updateWork(work.id, 'company', e.target.value)}
                      placeholder={t.company}
                      className="font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 mr-2"
                    />
                    {renderDeleteControl(work.id, () => removeWork(work.id))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={work.role}
                      onChange={(e) => updateWork(work.id, 'role', e.target.value)}
                      placeholder={t.role}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white sm:col-span-2"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={work.startYear}
                        onChange={(e) => updateWork(work.id, 'startYear', e.target.value)}
                        placeholder="Start"
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-center"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        value={work.endYear}
                        onChange={(e) => updateWork(work.id, 'endYear', e.target.value)}
                        placeholder="End / Present"
                        className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {t.responsibilities}
                    </label>
                    <textarea
                      rows={3}
                      value={work.description}
                      onChange={(e) => updateWork(work.id, 'description', e.target.value)}
                      placeholder="- Developed..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-[11px] leading-relaxed"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addWork}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addExperience}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 5. TRAINING & COURSES ================= */}
        <div
          ref={(el) => { sectionRefs.current['training'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('training')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>{t.training} ({data.trainingCourses.length})</span>
            </div>
            {isSectionOpen('training') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('training') && (
            <div className="p-4 space-y-3.5 bg-white border-t border-slate-100 text-xs">
              {data.trainingCourses.map((train) => (
                <div key={train.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={train.title}
                      onChange={(e) => updateTraining(train.id, 'title', e.target.value)}
                      placeholder={t.trainingTitle}
                      className="font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 mr-2"
                    />
                    {renderDeleteControl(train.id, () => removeTraining(train.id))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={train.institution}
                      onChange={(e) => updateTraining(train.id, 'institution', e.target.value)}
                      placeholder="Institute name"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={train.duration || ''}
                      onChange={(e) => updateTraining(train.id, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 3 Months)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={train.description || ''}
                    onChange={(e) => updateTraining(train.id, 'description', e.target.value)}
                    placeholder="Key concepts learned..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addTraining}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addTraining}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 6. PROJECTS (Academic & Personal Projects) ================= */}
        <div
          ref={(el) => { sectionRefs.current['projects'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('projects')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-teal-600" />
              <span>{t.projects} ({data.projects.length})</span>
            </div>
            {isSectionOpen('projects') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('projects') && (
            <div className="p-4 space-y-3.5 bg-white border-t border-slate-100 text-xs">
              {data.projects.map((proj) => (
                <div key={proj.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                      placeholder={t.projectTitle}
                      className="font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 mr-2"
                    />
                    {renderDeleteControl(proj.id, () => removeProject(proj.id))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={proj.tools || ''}
                      onChange={(e) => updateProject(proj.id, 'tools', e.target.value)}
                      placeholder={t.toolsUsed}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                      placeholder={t.projectLink}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                    placeholder="Project overview & key achievements..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addProject}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addProject}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 7. SKILLS ================= */}
        <div
          ref={(el) => { sectionRefs.current['skills'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-teal-600" />
              <span>{t.skills} ({data.skillCategories.length})</span>
            </div>
            {isSectionOpen('skills') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('skills') && (
            <div className="p-4 space-y-3 bg-white border-t border-slate-100 text-xs">
              {data.skillCategories.map((skill) => (
                <div key={skill.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                      placeholder={t.categoryName}
                      className="font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 mr-2"
                    />
                    {renderDeleteControl(skill.id, () => removeSkill(skill.id))}
                  </div>
                  <input
                    type="text"
                    value={skill.items}
                    onChange={(e) => updateSkill(skill.id, 'items', e.target.value)}
                    placeholder={t.skillItems}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addSkill}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addSkillCategory}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 8. REFERENCES ================= */}
        <div
          ref={(el) => { sectionRefs.current['references'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('references')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ContactRound className="w-4 h-4 text-teal-600" />
              <span>{t.references} ({data.references.length})</span>
            </div>
            {isSectionOpen('references') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('references') && (
            <div className="p-4 space-y-3.5 bg-white border-t border-slate-100 text-xs">
              {data.references.map((ref) => (
                <div key={ref.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                      placeholder={t.refName}
                      className="font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 mr-2"
                    />
                    {renderDeleteControl(ref.id, () => removeReference(ref.id))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={ref.designation}
                      onChange={(e) => updateReference(ref.id, 'designation', e.target.value)}
                      placeholder={t.designation}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={ref.organization}
                      onChange={(e) => updateReference(ref.id, 'organization', e.target.value)}
                      placeholder={t.organization}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={ref.phone}
                      onChange={(e) => updateReference(ref.id, 'phone', e.target.value)}
                      placeholder="Phone: +880 1711..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="email"
                      value={ref.email}
                      onChange={(e) => updateReference(ref.id, 'email', e.target.value)}
                      placeholder="Email: ref@domain.com"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addReference}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addReference}</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 9. HONORS, CERTIFICATIONS, ACTIVITIES, INTERESTS ================= */}
        <div
          ref={(el) => { sectionRefs.current['more'] = el; }}
          className="border border-slate-200 rounded-xl overflow-hidden transition scroll-mt-6"
        >
          <button
            type="button"
            onClick={() => toggleSection('more')}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>{t.honors}, {t.certifications} & {t.activities}</span>
            </div>
            {isSectionOpen('more') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isSectionOpen('more') && (
            <div className="p-4 space-y-4 bg-white border-t border-slate-100 text-xs">
              {/* Honors */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">{t.honors}</span>
                {data.honorsAwards.map((h) => (
                  <div key={h.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={h.year}
                          onChange={(e) => updateHonor(h.id, 'year', e.target.value)}
                          placeholder="Year"
                          className="w-20 px-2 py-1 rounded border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          value={h.title}
                          onChange={(e) => updateHonor(h.id, 'title', e.target.value)}
                          placeholder="Award Name"
                          className="flex-1 px-2 py-1 rounded border border-slate-200 bg-white"
                        />
                      </div>
                      {renderDeleteControl(h.id, () => removeHonor(h.id))}
                    </div>
                    <input
                      type="text"
                      value={h.description || ''}
                      onChange={(e) => updateHonor(h.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHonor}
                  className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.addHonor}
                </button>
              </div>

              {/* Certifications */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block">{t.certifications}</span>
                {data.certifications.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={c.year}
                        onChange={(e) => updateCert(c.id, 'year', e.target.value)}
                        placeholder="Year"
                        className="w-16 px-2 py-1 rounded border border-slate-200 bg-white text-center"
                      />
                      <input
                        type="text"
                        value={c.title}
                        onChange={(e) => updateCert(c.id, 'title', e.target.value)}
                        placeholder="Certificate title"
                        className="flex-1 px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                      <input
                        type="text"
                        value={c.issuer || ''}
                        onChange={(e) => updateCert(c.id, 'issuer', e.target.value)}
                        placeholder="Issuer"
                        className="w-24 px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    {renderDeleteControl(c.id, () => removeCert(c.id))}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCert}
                  className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.addCertification}
                </button>
              </div>

              {/* Activities */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block">{t.activities}</span>
                {data.activities.map((act) => (
                  <div key={act.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={act.organization}
                          onChange={(e) => updateActivity(act.id, 'organization', e.target.value)}
                          placeholder="Organization e.g. DUITS"
                          className="font-bold text-slate-800 px-2 py-1 rounded border border-slate-200 bg-white flex-1"
                        />
                        <input
                          type="text"
                          value={act.year}
                          onChange={(e) => updateActivity(act.id, 'year', e.target.value)}
                          placeholder="Year"
                          className="w-20 px-2 py-1 rounded border border-slate-200 bg-white text-center"
                        />
                      </div>
                      {renderDeleteControl(act.id, () => removeActivity(act.id))}
                    </div>
                    <input
                      type="text"
                      value={act.role}
                      onChange={(e) => updateActivity(act.id, 'role', e.target.value)}
                      placeholder="Role (e.g. Secretary)"
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-white"
                    />
                    <textarea
                      rows={2}
                      value={act.description}
                      onChange={(e) => updateActivity(act.id, 'description', e.target.value)}
                      placeholder="- Description..."
                      className="w-full p-2 rounded border border-slate-200 bg-white text-[11px]"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addActivity}
                  className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.addActivity}
                </button>
              </div>

              {/* Interests */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="font-bold text-slate-700 block">{t.interests}</label>
                <textarea
                  rows={2}
                  value={data.interests}
                  onChange={(e) => onChange({ ...data, interests: e.target.value })}
                  placeholder="- Photography, reading, football..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CVEditor = React.memo(CVEditorComponent);
