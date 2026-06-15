"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";
import React, { useRef } from "react";
import styles from "./timeline.module.css";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  image?: string;
  imageAlt?: string;
}

interface TimelineProps {
  data: TimelineEntry[];
  eyebrow?: string;
  title?: string;
  description?: string;
  images?: string[];
}

interface BackgroundLayerProps {
  image: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
}

interface TimelineSectionProps {
  item: TimelineEntry;
  index: number;
  count: number;
  eyebrow: string;
  title: string;
  description: string;
}

const defaultImages = ["/1.png", "/2.png", "/3.png", "/4.png"];

const BackgroundLayer = ({
  image,
  index,
  count,
  progress,
}: BackgroundLayerProps) => {
  const section = 1 / count;
  const start = index * section;
  const end = (index + 1) * section;
  const fadeInStart = Math.max(0, start - section * 0.35);
  const fadeInEnd = start + section * 0.15;
  const fadeOutStart = end - section * 0.35;
  const fadeOutEnd = Math.min(1, end + section * 0.05);

  const firstOpacity = useTransform(
    progress,
    [0, fadeOutStart, fadeOutEnd],
    [1, 1, 0]
  );
  const middleOpacity = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0]
  );
  const lastOpacity = useTransform(
    progress,
    [fadeInStart, fadeInEnd, 1],
    [0, 1, 1]
  );
  const opacity =
    index === 0
      ? firstOpacity
      : index === count - 1
        ? lastOpacity
        : middleOpacity;

  const scale = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutEnd],
    [0.9, 0.86, 0.88]
  );
  const y = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutEnd],
    ["80px", "0px", "-60px"]
  );
  const rotateX = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutEnd],
    [2, 0, -2]
  );
  const rotateY = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutEnd],
    [-3, 0, 3]
  );
  const z = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutEnd],
    [0, 180, 0]
  );
  const blur = useTransform(
    progress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [4, 0, 0, 3]
  );

  // Level-up glow effect
  const brightness = useTransform(
    progress,
    [fadeInStart, start, start + 0.02, fadeInEnd],
    [1, 1, 1.4, 1]
  );
  const filter = useMotionTemplate`blur(${blur}px) brightness(${brightness})`;

  return (
    <motion.div
      className={styles.backgroundLayer}
      style={{
        opacity,
        scale,
        y,
        rotateX,
        rotateY,
        z,
        filter,
        backgroundImage: `url(${image})`,
      }}
      aria-hidden="true"
    />
  );
};

const TimelineSection = ({
  item,
  index,
  count,
  eyebrow,
  title,
  description,
}: TimelineSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.35,
  });
  const opacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.78, 1],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    smoothProgress,
    [0, 0.24, 0.76, 1],
    [72, 0, 0, -72]
  );
  const blur = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [8, 0, 0, 8]
  );
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <section ref={sectionRef} className={styles.section}>
      <motion.div
        className={styles.sectionInner}
        style={shouldReduceMotion ? undefined : { opacity, y, filter }}
      >
        <div className={styles.sectionMeta}>
          <span className={styles.sectionNumber}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.sectionRule} />
          <span className={styles.sectionCount}>
            {String(count).padStart(2, "0")}
          </span>
        </div>

        {index === 0 && (
          <header className={styles.intro}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 className={styles.heading}>{title}</h2>
            <p className={styles.description}>{description}</p>
          </header>
        )}

        <div className={styles.story}>
          <h3 className={styles.storyTitle}>{item.title}</h3>
          <div className={styles.storyContent}>{item.content}</div>
        </div>
      </motion.div>
    </section>
  );
};

export const Timeline = ({
  data,
  eyebrow = "Learning path",
  title = "Build skills that hold up in the real world",
  description = "Move from core concepts to hands-on offensive and defensive security work.",
  images = defaultImages,
}: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const resolvedImages = data.map(
    (entry, index) => entry.image ?? images[index] ?? images[images.length - 1]
  );
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className={styles.timeline}>
      <div className={styles.stickyBackground} aria-hidden="true">
        <div className={styles.backgroundCamera}>
          {resolvedImages.map((image, index) => (
            <BackgroundLayer
              key={`${image}-${index}`}
              image={image}
              index={index}
              count={resolvedImages.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
        <div className={styles.ambientGlow} />
        <div className={styles.glassOverlay} />
        <div className={styles.gradientOverlay} />
        <div className={styles.vignette} />
        <div className={styles.noise} />
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <motion.div
          className={styles.progressFill}
          style={{ height: progressHeight }}
        />
      </div>

      <div className={styles.contentLayer}>
        {data.map((item, index) => (
          <TimelineSection
            key={item.title}
            item={item}
            index={index}
            count={data.length}
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        ))}
      </div>
    </div>
  );
};
