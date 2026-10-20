import React, { memo, useMemo } from "react";
import { ExternalLink, Swords } from "lucide-react";
import { motion } from "framer-motion";

// --- Animation Variants ---
const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};


// --- Child Components (Unchanged) ---
const PlatformCard = React.memo(({ platform }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6 flex flex-col items-center text-center h-full"
  >
    <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-background shadow border border-border/60 mb-4">
      <img
        src={platform.logo}
        alt={`${platform.name} Logo`}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
    <div className="text-lg font-semibold text-foreground">{platform.name}</div>
    <div className="text-sm text-muted-foreground mt-1 mb-1">
      <span className="text-foreground/80">Profile:</span>{" "}
      <a
        href={platform.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline transition"
      >
        {platform.handle}
      </a>
    </div>
    <div className="flex flex-col gap-[2px] text-sm text-muted-foreground mb-3">
      {platform.stats.map((stat, i) => (
        <div key={i}>
          {stat.label}:{" "}
          <span className="font-medium text-foreground/80">{stat.value}</span>
        </div>
      ))}
    </div>
    <a
      href={platform.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto pt-3 flex items-center gap-1 text-primary font-medium text-sm hover:underline transition"
    >
      <ExternalLink className="w-4 h-4" />
      View Profile
    </a>
  </motion.div>
));
PlatformCard.displayName = "PlatformCard";

const HighlightItem = React.memo(({ item }) => (
  <motion.li variants={itemVariants}>
    {item.text}
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline font-medium transition"
    >
      {item.linkText}
    </a>
    {item.rest}
  </motion.li>
));
HighlightItem.displayName = "HighlightItem";


// --- Main Component ---
function CompetitiveProgrammingComponent() {
  const cpPlatforms = useMemo(() => [
    {
      name: "GitHub",
      logo: "https://logos-world.net/wp-content/uploads/2020/11/GitHub-Logo.png",
      handle: "Gatungo Simon Wanyoike",
      profileUrl: "https://github.com/simon9001",
      stats: [
        { label: "Focus", value: "Full-Stack Systems" },
        { label: "Stack", value: "React, Django, Flutter, Python" },
      ],
    },
    {
      name: "LinkedIn",
      logo: "https://tse1.mm.bing.net/th/id/OIP.waOtRAV99hCXTCS_RvbK6QHaGp?rs=1&pid=ImgDetMain&o=7&rm=3",
      handle: "Software Engineer | IT Graduate",
      profileUrl: "https://linkedin.com/in/simongatungob8a429225",
      stats: [
        { label: "Experience", value: "Teach2Give + Industry Projects" },
        { label: "Interest", value: "AgriTech & Scalable Systems" },
      ],
    },
    {
      name: "Portfolio",
      logo: "https://tse4.mm.bing.net/th/id/OIP.cdqUIzE0IEXiIkex0exI7AHaEb?rs=1&pid=ImgDetMain&o=7&rm=3",
      handle: "Live Projects",
      profileUrl: "https://yourportfolio.com",
      stats: [
        { label: "Systems", value: "Rental, Voting, Advisory" },
        { label: "Approach", value: "Problem-Driven Design" },
      ],
    },
    {
      name: "Learning Platforms",
      logo: "https://tse3.mm.bing.net/th/id/OIP.bu7FjvCaomJd6NhQOb0jlAHaES?rs=1&pid=ImgDetMain&o=7&rm=3",
      handle: "Continuous Learning",
      profileUrl: "#",
      stats: [
        { label: "Skills", value: "APIs, Auth, Databases" },
        { label: "Mindset", value: "Production-Ready Code" },
      ],
    },
  ], []);

  const highlights = useMemo(() => [
    {
      text: "Built and deployed multiple ",
      linkText: "full-stack systems",
      href: "#",
      rest: " including rental platforms, voting systems, and agriculture-focused solutions.",
    },
    {
      text: "Completed intensive ",
      linkText: "software engineering training",
      href: "#",
      rest: " at Teach2Give with a strong emphasis on real-world project delivery.",
    },
    {
      text: "Designed scalable backends using ",
      linkText: "Django and REST APIs",
      href: "#",
      rest: ", focusing on clean architecture and maintainability.",
    },
    {
      text: "Developed modern frontends with ",
      linkText: "React, Vite, and Tailwind",
      href: "#",
      rest: ", prioritizing UX and performance.",
    },
    {
      text: "Explored cross-platform development using ",
      linkText: "Flutter",
      href: "#",
      rest: " to build reusable and efficient mobile interfaces.",
    },
  ], []);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        variants={sectionContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center w-full space-y-16"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-foreground">
            <Swords className="w-8 h-8 text-primary drop-shadow-sm" />
            <span>Software Engineering Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            My journey focuses on building practical, scalable systems that solve
            real problems. This section highlights my platforms, engineering mindset,
            and key milestones along the way.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-5xl">
          <motion.div
            variants={listContainerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {cpPlatforms.map((platform) => (
              <PlatformCard key={platform.name} platform={platform} />
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-3xl">
          <div className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Key Highlights
            </h3>
            <motion.ul
              variants={listContainerVariants}
              className="list-disc ml-5 space-y-2 text-base text-muted-foreground"
            >
              {highlights.map((item, index) => (
                <HighlightItem key={index} item={item} />
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default React.memo(CompetitiveProgrammingComponent);
