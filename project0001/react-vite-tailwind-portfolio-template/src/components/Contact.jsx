import React, { useState, memo } from "react";
import { Mail, Send, Phone, Facebook, Youtube, Instagram, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const StatusMessage = ({ status, message }) => {
  if (status === "idle") return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${status === "success"
        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
        : status === "error"
          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
        }`}
    >
      {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === "success" && <CheckCircle2 className="w-4 h-4" />}
      {status === "error" && <AlertCircle className="w-4 h-4" />}
      {message}
    </motion.div>
  );
};

function ContactComponent() {
  const [formState, setFormState] = useState({ status: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState({ status: "loading", message: "Sending..." });

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formspree.io/f/xjgeywbg", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormState({ status: "success", message: "Message sent! We'll get back to you soon." });
        e.target.reset();
      } else {
        const errorData = await response.json();
        setFormState({
          status: "error",
          message: errorData.error || "Failed to send message. Please try again."
        });
      }
    } catch (error) {
      setFormState({
        status: "error",
        message: "An error occurred. Please check your connection."
      });
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        variants={sectionContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-8 w-full max-w-xl"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-center text-foreground pb-4">
            Contact Us
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span>+254 784 298 879</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span>FarmWithIrene@gmail.com</span>
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={formContainerVariants}
          className="w-full p-6 sm:p-8 bg-white/90 dark:bg-neutral-900/80 border border-green-200 dark:border-green-800/60 rounded-2xl shadow space-y-4"
        >
          <AnimatePresence>
            <motion.div key={formState.status} variants={itemVariants} layout>
              <StatusMessage status={formState.status} message={formState.message} />
            </motion.div>
          </AnimatePresence>
          <motion.div variants={itemVariants}>
            <Input type="text" name="name" placeholder="Your Name" required disabled={formState.status === "loading"} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Input type="email" name="email" placeholder="Your Email" required disabled={formState.status === "loading"} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Textarea rows={4} name="message" placeholder="Your Message" required disabled={formState.status === "loading"} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              disabled={formState.status === "loading"}
              className="w-full text-lg font-semibold py-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {formState.status === "loading" ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground font-medium italic">
            Follow us for more updates:
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              title="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              title="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              title="TikTok"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              title="YouTube"
            >
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default memo(ContactComponent);
