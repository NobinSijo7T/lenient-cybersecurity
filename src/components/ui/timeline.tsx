"use client";

import {
  motion,
  useScroll,
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
    [1.05, 1, 1.02]
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
    ["blur(4px)", "blur(0px)", "blur(0px)", "blur(3px)"]
  );
  
  // Level-up glow effect
  const brightness = useTransform(
    progress,
    [fadeInStart, start, start + 0.02, fadeInEnd],
    [1, 1, 1.4, 1]
  );

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
        filter: blur,
        backgroundImage: `url(${image})`,
        brightness,
      }}
      aria-hidden="true"
    />
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
          <section className={styles.section} key={item.title}>
            <div className={styles.sectionInner}>
              <div className={styles.sectionMeta}>
                <span className={styles.sectionNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.sectionRule} />
                <span className={styles.sectionCount}>
                  {String(data.length).padStart(2, "0")}
                </span>
              </div>

              {index === 0 && (
                <header className={styles.intro}>
                  <p className={styles.eyebrow}>{eyebrow}</p>
                  <h2 className={styles.heading}>{title}</h2>
                  <p className={styles.description}>{description}</p>
                </header>
              )}

              <motion.div
                className={styles.story}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.35 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className={styles.storyTitle}>{item.title}</h3>
                <div className={styles.storyContent}>{item.content}</div>
              </motion.div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
