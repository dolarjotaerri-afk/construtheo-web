"use client";

import type { CSSProperties } from "react";

type Course = {
  title: string;
  subtitle: string;
  tag: string;
};

const professionalCourses: Course[] = [
  {
    title: "Curso para pedreiro",
    subtitle: "Fundamentos de obra, alvenaria, preparo e execução.",
    tag: "Em breve",
  },
  {
    title: "Curso para pintor",
    subtitle: "Preparação de parede, acabamento e pintura profissional.",
    tag: "Em breve",
  },
  {
    title: "Curso para eletricista",
    subtitle: "Noções de elétrica residencial, segurança e manutenção.",
    tag: "Em breve",
  },
  {
    title: "Curso para encanador",
    subtitle: "Hidráulica básica, reparos, instalações e manutenção.",
    tag: "Em breve",
  },
  {
    title: "Curso para gesseiro",
    subtitle: "Forro, drywall, sancas e acabamento em gesso.",
    tag: "Em breve",
  },
];

export default function ProfessionalCoursesCarousel() {
  return (
    <section style={sectionBlockStyle}>
      <div style={{ marginBottom: 12 }}>
        <p style={sectionLabelStyle}>Qualificação</p>

        <h2 style={sectionTitleStyle}>
          Indique ou realize um curso profissionalizante
        </h2>

        <p style={sectionTextStyle}>
          Em breve, o ConstruThéo também poderá conectar profissionais a cursos
          da construção civil.
        </p>
      </div>

      <div style={carouselStyle}>
        {professionalCourses.map((curso) => (
          <button key={curso.title} type="button" disabled style={courseCardStyle}>
            <div style={lockCircleStyle}>🔒</div>

            <p style={courseTitleStyle}>{curso.title}</p>

            <p style={courseTextStyle}>{curso.subtitle}</p>

            <span style={lockedTagStyle}>{curso.tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const sectionBlockStyle: CSSProperties = {
  marginBottom: 24,
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 24,
  padding: "15px 14px 16px",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#2563EB",
  marginBottom: 4,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "#111827",
  marginBottom: 4,
};

const sectionTextStyle: CSSProperties = {
  fontSize: "0.78rem",
  color: "#6B7280",
  lineHeight: 1.35,
};

const carouselStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  paddingBottom: 4,
  paddingLeft: 2,
  paddingRight: 2,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const courseCardStyle: CSSProperties = {
  minWidth: 150,
  maxWidth: 150,
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  background: "#FFFFFF",
  padding: "13px 12px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
  cursor: "not-allowed",
  opacity: 0.82,
  textAlign: "left",
};

const lockCircleStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "999px",
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.9rem",
  marginBottom: 10,
};

const courseTitleStyle: CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  marginBottom: 6,
};

const courseTextStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  marginBottom: 10,
  lineHeight: 1.3,
  minHeight: 46,
};

const lockedTagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#F3F4F6",
  color: "#6B7280",
  fontSize: "0.65rem",
  fontWeight: 800,
};