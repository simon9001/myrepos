import React, { useMemo, memo } from "react";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

// --- Animation Variants (The "Staggered Entrance" Pattern) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

//bhhgh
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// --- Child Component ---
const EducationCard = memo(({ education }) => {
  const { logo, alt, title, link, program, year, scoreLabel, score } = education;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 flex items-center gap-6"
    >
      <div className="w-16 h-16 flex-shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shadow rounded-xl p-1 overflow-hidden">
        <img
          src={logo}
          alt={alt}
          className="w-full h-full object-contain rounded-lg"
          loading="lazy"
          decoding="async"
          width={64}
          height={64}
          style={{ aspectRatio: "1/1" }}
        />
      </div>
      <div className="flex flex-col text-left gap-1">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
          {title}
        </h3>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline hover:text-foreground dark:hover:text-primary-foreground/70 font-medium transition-colors duration-200"
        >
          {program}
        </a>
        <div className="text-sm text-muted-foreground mt-2 space-y-1">
          <p>
            <span className="font-medium text-foreground/80">Year:</span> {year}
          </p>
          <p>
            <span className="font-medium text-foreground/80">
              {scoreLabel}:
            </span>{" "}
            {score}
          </p>
        </div>
      </div>
    </motion.div>
  );
});
EducationCard.displayName = "EducationCard";

// --- Updated Academic Data ---
const ACADEMICS_DATA = [
  {
    logo: "https://avatars.githubusercontent.com/u/155526985?s=280&v=4",
    alt: "Teach2Give Logo",
    title: "Teach2Give",
    link: "https://teach2give.com/",
    program: "Software Engineering Program",
    year: "2024",
    scoreLabel: "Focus Areas",
    score: "Backend Development, APIs, System Design",
  },
  {
    logo: "data:image/png;base64,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",
    alt: "University of Embu Logo",
    title: "University of Embu",
    link: "https://www.embuni.ac.ke/",
    program: "BSc Information Technology",
    year: "2021 – 2025",
    scoreLabel: "Class",
    score: "Second Class Honors (Upper Division)",
  },
];

// --- Main Academics Component ---
const AcademicsComponent = memo(function Academics() {
  const educationCards = useMemo(
    () =>
      ACADEMICS_DATA.map((education, index) => (
        <EducationCard
          key={`${education.title}-${index}`}
          education={education}
        />
      )),
    []
  );

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center w-full"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 flex items-center gap-4 text-foreground">
            <GraduationCap className="w-8 h-8 sm:w-11 sm:h-11 text-primary drop-shadow-sm" />
            Education
          </h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            My academic journey combines a solid foundation in Information
            Technology with hands-on software engineering training. Through
            formal education and practical programs, I’ve built the skills
            required to design, develop, and maintain real-world systems.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="w-full max-w-2xl flex flex-col gap-8"
        >
          {educationCards}
        </motion.div>
      </motion.div>
    </div>
  );
});

AcademicsComponent.displayName = "Academics";

export default AcademicsComponent;
