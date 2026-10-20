import React, { memo, useMemo } from "react";
import { Code, ExternalLink, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const ProjectCard = memo(({ project }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 flex flex-col h-full"
    >
      <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
        {project.title}
      </h3>

      <p className="text-base text-muted-foreground mb-4 flex-grow">
        {project.desc}
      </p>

      <div className="flex flex-wrap gap-2 mb-5 mt-auto">
        {project.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        {project.links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline hover:text-foreground transition-colors"
          >
            {link.type === "code" ? <Code className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            {link.type === "code" ? "Code" : "Demo"}
          </a>
        ))}
      </div>
    </motion.div>
  );
});
ProjectCard.displayName = "ProjectCard";

function ProjectsComponent() {
  const projectsData = useMemo(
    () => [
      {
        title: "RENT_ME_A_KEJA – Property Rental Platform",
        desc: "A full-stack property rental platform enabling landlords to list houses and tenants to search, book, and manage rentals. Includes authentication, role-based access, and payment workflow integration.",
        tags: ["React", "Vite", "Django", "REST API", "PostgreSQL"],
        links: [{ type: "code", href: "https://github.com/yourusername/rent-me-a-keja" }],
      },
      {
        title: "Car Rental Management System",
        desc: "A web-based system for managing vehicle listings, bookings, customers, and availability. Designed with a clean admin dashboard and optimized database relationships.",
        tags: ["Django", "Python", "Bootstrap", "PostgreSQL"],
        links: [{ type: "code", href: "https://github.com/yourusername/car-rental-system" }],
      },
      {
        title: "Online Voting System",
        desc: "Secure online voting platform with user authentication, vote integrity checks, and real-time result tallying. Built to demonstrate transparency and system reliability.",
        tags: ["Django", "React", "JWT", "System Security"],
        links: [{ type: "code", href: "https://github.com/yourusername/online-voting-system" }],
      },
      {
        title: "Face Recognition Attendance System",
        desc: "An AI-powered attendance system using face recognition to automatically log attendance. Designed for institutions to reduce fraud and manual record keeping.",
        tags: ["Python", "OpenCV", "Machine Learning", "Computer Vision"],
        links: [{ type: "code", href: "https://github.com/yourusername/face-recognition-attendance" }],
      },
      {
        title: "Agriculture Advisory Web Platform",
        desc: "An agriculture-focused platform providing farmers with advisory content, consultation booking, and digital service access. Designed for scalability and future AI integration.",
        tags: ["React", "Hono", "API Design", "AgriTech"],
        links: [{ type: "code", href: "https://github.com/yourusername/agri-advisory-platform" }],
      },
      {
        title: "Cross-Platform Mobile App Prototype",
        desc: "A Flutter-based mobile application prototype focusing on clean UI, reusable components, and API-driven data flow for real-world business use cases.",
        tags: ["Flutter", "Dart", "Mobile Development", "REST APIs"],
        links: [{ type: "code", href: "https://github.com/yourusername/flutter-app" }],
      },
    ],
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
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center gap-4 text-foreground">
            <FolderKanban className="w-8 h-8 sm:w-11 sm:h-11 text-primary" />
            Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            These projects reflect my journey as an Information Technology graduate and software engineer,
            blending backend systems, modern frontend frameworks, mobile development, and practical problem-solving.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projectsData.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}


export default memo(ProjectsComponent);