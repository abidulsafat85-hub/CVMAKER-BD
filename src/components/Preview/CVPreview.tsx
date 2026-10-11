import React from 'react';
import { CVData, EDUCATION_LEVEL_RANKS } from '../../types/cv';
import { formatFullAddress } from '../CascadingAddressPicker';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Play,
} from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
  isPdfMode?: boolean;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ data, isPdfMode = false }) => {
  const {
    personal,
    objective,
    education,
    workExperience,
    trainingCourses,
    projects,
    activities,
    skillCategories,
    honorsAwards,
    certifications,
    references,
    interests,
    themeColor,
  } = data;

  const hexTheme = themeColor || '#389ba8';

  // Format bullet lines helper
  const renderBullets = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      return (
        <div key={idx} style={{ color: '#334155', fontSize: '10px', lineHeight: '1.34' }}>
          {trimmed}
        </div>
      );
    });
  };

  // 1st Honours / Bachelor, 2nd HSC / A-Level / Alim / Diploma, 3rd SSC / O-Level / Dakhil
  const sortedEducation = [...education].sort(
    (a, b) => (EDUCATION_LEVEL_RANKS[b.level] || 0) - (EDUCATION_LEVEL_RANKS[a.level] || 0)
  );

  const formattedPresentAddr = formatFullAddress(personal.presentAddress);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        width: '100%',
        maxWidth: '794px',
        minHeight: '1123px',
        maxHeight: isPdfMode ? '1123px' : undefined,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'geometricPrecision',
      }}
      className={isPdfMode ? '' : 'shadow-xl rounded-sm print:shadow-none print:rounded-none mx-auto'}
    >
      {/* ================= HEADER SECTION ================= */}
      <div style={{ padding: '20px 26px 10px 26px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Candidate Name & Job Title */}
          <div style={{ flex: '1', paddingRight: '16px', paddingTop: '2px' }}>
            <h1
              style={{
                color: hexTheme,
                fontSize: '26px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: '1.15',
                margin: 0,
              }}
            >
              {personal.fullName || 'FULL NAME'}
            </h1>
            <p
              style={{
                color: hexTheme,
                fontSize: '12.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: '3px',
                marginBottom: 0,
                opacity: 0.9,
              }}
            >
              {personal.jobTitle || 'JOB TITLE'}
            </p>
          </div>

          {/* Candidate Avatar / Photo (Ultra-sharp rendering, high-definition zoom) */}
          {personal.showAvatar && personal.avatarUrl && (
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 10, marginBottom: '-32px' }}>
              <div
                style={{
                  width: '114px',
                  height: '142px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px -4px rgba(0, 0, 0, 0.22)',
                  border: '3px solid #ffffff',
                  backgroundColor: '#ffffff',
                }}
              >
                <img
                  src={personal.avatarUrl}
                  alt={personal.fullName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    backgroundColor: '#ffffff',
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= HERO BANNER ================= */}
      <div
        style={{
          backgroundColor: hexTheme,
          padding: '14px 26px',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Objective */}
        {objective && (
          <div style={{ marginBottom: '10px', maxWidth: personal.showAvatar && personal.avatarUrl ? '76%' : '100%' }}>
            <h2
              style={{
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#ffffff',
                margin: '0 0 3px 0',
              }}
            >
              OBJECTIVE
            </h2>
            <p
              style={{
                fontSize: '10px',
                lineHeight: '1.38',
                color: '#f0fdfa',
                fontWeight: 400,
                margin: 0,
              }}
            >
              {objective}
            </p>
          </div>
        )}

        {/* Contact Information Grid */}
        {(personal.phone || personal.email || formattedPresentAddr || personal.website || personal.birthDate || personal.gender) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              rowGap: '6px',
              columnGap: '12px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '10px',
            }}
          >
            {personal.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone style={{ width: '9px', height: '9px', color: '#ffffff' }} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personal.phone}</span>
              </div>
            )}

            {personal.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail style={{ width: '9px', height: '9px', color: '#ffffff' }} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personal.email}</span>
              </div>
            )}

            {formattedPresentAddr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin style={{ width: '9px', height: '9px', color: '#ffffff' }} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formattedPresentAddr}</span>
              </div>
            )}

            {personal.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe style={{ width: '9px', height: '9px', color: '#ffffff' }} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {personal.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </span>
              </div>
            )}

            {personal.birthDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar style={{ width: '9px', height: '9px', color: '#ffffff' }} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personal.birthDate}</span>
              </div>
            )}

            {personal.gender && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User style={{ width: '9px', height: '9px', color: '#ffffff' }} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{personal.gender}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= BODY: TWO COLUMNS (OPTIMIZED TO FIT CLEANLY ON 1 PAGE) ================= */}
      <div
        style={{
          padding: '16px 26px 18px 26px',
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gap: '20px',
        }}
      >
        {/* LEFT COLUMN: Education, Work Experience (if any), Projects, Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          {/* 1. EDUCATIONAL QUALIFICATIONS (1st Honours, 2nd HSC, 3rd SSC) */}
          {sortedEducation.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                EDUCATIONAL QUALIFICATIONS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedEducation.map((edu) => {
                  const isVarsity =
                    edu.level === 'Honours / Bachelor' ||
                    edu.level === 'Masters' ||
                    edu.level === 'PhD';

                  const displayDegree = edu.degreeTitle || (
                    edu.level === 'Honours / Bachelor' ? 'Bachelor' :
                    edu.level === 'HSC / A-Level / Alim / Diploma' ? 'HSC' :
                    edu.level === 'SSC / O-Level / Dakhil' ? 'SSC' :
                    edu.level
                  );

                  return (
                    <div key={edu.id} style={{ fontSize: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a', fontSize: '10.5px' }}>
                          <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                          <span>{displayDegree}{edu.institution ? `: ${edu.institution}` : ''}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '10px', flexShrink: 0, marginLeft: '6px' }}>
                          {edu.passingYear}
                        </span>
                      </div>

                      <div style={{ paddingLeft: '10px', marginTop: '1.5px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {edu.department && (
                          <div style={{ fontStyle: 'italic', color: '#334155' }}>
                            Course / Department: {edu.department}
                          </div>
                        )}
                        {(edu.board || edu.group) && (
                          <div style={{ color: '#475569' }}>
                            {edu.board ? `Board: ${edu.board}` : ''}
                            {edu.board && edu.group ? ' · ' : ''}
                            {edu.group ? `Group: ${edu.group}` : ''}
                          </div>
                        )}
                        {/* Varsity shows strictly CGPA; SSC/HSC shows GPA with optional (All Subject A+) */}
                        <div style={{ color: '#334155', fontWeight: 500 }}>
                          {isVarsity ? (
                            <>CGPA: <strong style={{ color: '#0f172a' }}>{edu.result}</strong></>
                          ) : (
                            <>
                              GPA: <strong style={{ color: '#0f172a' }}>{edu.result}</strong>
                              {edu.allSubjectAplus ? ' (All Subject A+)' : ''}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. WORK EXPERIENCE (FRESHER FRIENDLY: completely omitted if empty) */}
          {workExperience.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                WORK EXPERIENCE
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {workExperience.map((work) => (
                  <div key={work.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a', fontSize: '10.5px' }}>
                        <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                        <span>{work.company}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '10px', flexShrink: 0, marginLeft: '6px' }}>
                        {work.startYear} - {work.endYear}
                      </span>
                    </div>
                    <div style={{ paddingLeft: '10px', marginTop: '1px' }}>
                      <div style={{ fontStyle: 'italic', color: '#334155', marginBottom: '2px' }}>
                        {work.role}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
                        {renderBullets(work.description)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. KEY PROJECTS */}
          {projects.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                KEY PROJECTS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {projects.map((proj) => (
                  <div key={proj.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a', fontSize: '10.5px' }}>
                        <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                        <span>{proj.title}</span>
                      </div>
                      {proj.link && (
                        <span style={{ color: hexTheme, fontSize: '9px', fontWeight: 600 }}>
                          {proj.link.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                    </div>
                    <div style={{ paddingLeft: '10px', marginTop: '1px' }}>
                      {proj.tools && (
                        <div style={{ color: '#475569', fontSize: '9.5px', marginBottom: '1px' }}>
                          <strong style={{ color: '#334155' }}>Tech Stack:</strong> {proj.tools}
                        </div>
                      )}
                      <div style={{ color: '#334155' }}>
                        {renderBullets(proj.description)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. ACTIVITIES & LEADERSHIP */}
          {activities.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                ACTIVITIES & LEADERSHIP
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {activities.map((act) => (
                  <div key={act.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a', fontSize: '10.5px' }}>
                        <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                        <span>{act.organization}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '10px', flexShrink: 0, marginLeft: '6px' }}>
                        {act.year}
                      </span>
                    </div>
                    <div style={{ paddingLeft: '10px', marginTop: '1px' }}>
                      <div style={{ fontStyle: 'italic', color: '#334155', marginBottom: '1px' }}>
                        {act.role}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {renderBullets(act.description)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Skills, Training, Awards, Certifications, References, Interests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          {/* 1. SKILLS */}
          {skillCategories.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                SKILLS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {skillCategories.map((skill) => (
                  <div key={skill.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                      <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                      <span>{skill.name}</span>
                    </div>
                    <div style={{ paddingLeft: '10px', marginTop: '1px', color: '#334155' }}>
                      - {skill.items}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. TRAINING & COURSES */}
          {trainingCourses.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                TRAINING & COURSES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {trainingCourses.map((train) => (
                  <div key={train.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                        <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                        <span>{train.title}</span>
                      </div>
                    </div>
                    <div style={{ paddingLeft: '10px', marginTop: '1px', color: '#475569' }}>
                      <div>{train.institution} {train.duration ? `(${train.duration})` : ''}</div>
                      {train.description && (
                        <div style={{ color: '#334155', marginTop: '1px' }}>
                          {renderBullets(train.description)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. HONORS & AWARDS */}
          {honorsAwards.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                HONORS & AWARDS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {honorsAwards.map((honor) => (
                  <div key={honor.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                      <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                      <span>{honor.year}</span>
                    </div>
                    <div style={{ paddingLeft: '10px', marginTop: '1px', color: '#334155' }}>
                      <strong style={{ color: '#0f172a' }}>{honor.title}</strong>
                      {honor.description ? ` - ${honor.description}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. CERTIFICATIONS */}
          {certifications.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                CERTIFICATIONS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {certifications.map((cert) => (
                  <div key={cert.id} style={{ fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                      <Play style={{ width: '6px', height: '6px', fill: '#0f172a', stroke: 'none', flexShrink: 0 }} />
                      <span>{cert.title}</span>
                    </div>
                    <div style={{ paddingLeft: '10px', color: '#475569' }}>
                      {cert.issuer ? `Issued by: ${cert.issuer} (${cert.year})` : cert.year}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. REFERENCES */}
          {references.length > 0 && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 7px 0',
                }}
              >
                REFERENCES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {references.map((ref) => (
                  <div key={ref.id} style={{ fontSize: '10px', color: '#334155' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '10.5px' }}>
                      {ref.name}
                    </div>
                    <div>{ref.designation}</div>
                    <div style={{ color: '#475569' }}>{ref.organization}</div>
                    {ref.phone && <div>Phone: {ref.phone}</div>}
                    {ref.email && <div>Email: {ref.email}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. INTERESTS */}
          {interests && (
            <section>
              <h3
                style={{
                  fontSize: '11.5px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0f172a',
                  paddingBottom: '2.5px',
                  borderBottom: '2px solid #0f172a',
                  margin: '0 0 5px 0',
                }}
              >
                INTERESTS
              </h3>
              <div style={{ fontSize: '10px', color: '#334155' }}>
                {renderBullets(interests)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
