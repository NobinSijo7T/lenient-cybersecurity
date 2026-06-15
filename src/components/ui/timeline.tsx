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

interface TypewriterTextProps {
  text: string;
  progress: MotionValue<number>;
  className?: string;
  startProgress?: number;
  endProgress?: number;
}

interface TypewriterCharProps {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  startProgress: number;
  endProgress: number;
}

const TypewriterChar = ({
  char,
  index,
  total,
  progress,
  startProgress,
  endProgress,
}: TypewriterCharProps) => {
  const charProgress = index / Math.max(1, total);
  const charStart = startProgress + charProgress * (endProgress - startProgress);
  const charEnd = charStart + 0.05;
  const opacity = useTransform(progress, [charStart, charEnd], [0, 1]);
  const y = useTransform(progress, [charStart, charEnd], [20, 0]);
  const blur = useTransform(progress, [charStart, charEnd], [4, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.span
      className={styles.typewriterChar}
      style={{ opacity, y, filter }}
    >
      {char}
    </motion.span>
  );
};

const TypewriterText = ({ 
  text, 
  progress, 
  className,
  startProgress = 0.16,
  endProgress = 0.4
}: TypewriterTextProps) => {
  const words = text.split(" ");
  const totalChars = text.replace(/\s/g, "").length;
  let charIndex = 0;

  return (
    <div className={[className, styles.typewriterText].filter(Boolean).join(" ")}>
      {words.map((word, wordIndex) => (
        <span className={styles.typewriterWord} key={`${word}-${wordIndex}`}>
          {word.split("").map((char) => {
            const currentIndex = charIndex;
            charIndex += 1;

            return (
              <TypewriterChar
                key={`${char}-${wordIndex}-${currentIndex}`}
                char={char}
                index={currentIndex}
                total={totalChars}
                progress={progress}
                startProgress={startProgress}
                endProgress={endProgress}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
};

const AnimatedWord = ({
  word,
  index,
  count,
  progress,
}: {
  word: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) => {
  const stagger = Math.min(0.025, 0.12 / count);
  const enterStart = 0.08 + index * stagger;
  const enterEnd = enterStart + 0.16;
  const exitStart = 0.76 + index * stagger;
  const exitEnd = Math.min(0.98, exitStart + 0.14);
  const opacity = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [64, 0, 0, -64]
  );
  const rotateX = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [70, 0, 0, -70]
  );
  const blur = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [10, 0, 0, 10]
  );
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <span className={styles.wordClip}>
      <motion.span
        className={styles.animatedWord}
        style={{ opacity, y, rotateX, filter }}
      >
        {word}
      </motion.span>
    </span>
  );
};

const AnimatedWords = ({ text, progress, className }: AnimatedWordsProps) => {
  const words = text.split(" ");

  return (
    <div className={className} aria-label={text}>
      {words.map((word, index) => (
        <AnimatedWord
          key={`${word}-${index}`}
          word={word}
          index={index}
          count={words.length}
          progress={progress}
        />
      ))}
    </div>
  );
};

/*
        return (
          <motion.span
            key={`${char}-${index}`}
            style={{ 
              opacity, 
              y,
              filter,
              display: 'inline-block',
              whiteSpace: 'pre',
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
};
*/

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

interface AnimatedWordsProps {
  text: string;
  progress: MotionValue<number>;
  className: string;
}

const defaultImages = ["/1.png", "/2.png", "/3.png", "/4.png"];
const levelEffectClasses = [
  "levelEffectSignal",
  "levelEffectPulse",
  "levelEffectShield",
  "levelEffectPortal",
] as const;

const levelMotionPresets = [
  {
    titleX: [-180, -24, 0, 0, 96],
    titleY: [36, 0, 0, 0, -34],
    titleScale: [0.94, 1.03, 1, 1, 0.98],
    titleRotateX: [0, 0, 0, 0, 0],
    titleRotateZ: [-10, 2, 0, 0, 5],
    titleSkewX: [-10, -2, 0, 0, 6],
    titleScaleX: [1, 1, 1, 1, 1],
    titleLetterSpacing: ["0.02em", "0.005em", "0em", "0em", "0.02em"],
    cardX: [160, 20, 0, 0, -90],
    cardY: [28, 0, 0, 0, -26],
    cardScale: [0.9, 1.02, 1, 1, 0.94],
    cardRotateX: [0, 0, 0, 0, 0],
    cardRotateY: [-14, -2, 0, 0, 8],
    cardRotateZ: [0, 0, 0, 0, -2],
  },
  {
    titleX: [0, 0, 0, 0, 0],
    titleY: [78, 10, 0, 0, -62],
    titleScale: [0.54, 1.08, 1, 1, 1.12],
    titleRotateX: [42, 8, 0, 0, -22],
    titleRotateZ: [0, 0, 0, 0, 0],
    titleSkewX: [0, 0, 0, 0, 0],
    titleScaleX: [1, 1, 1, 1, 1],
    titleLetterSpacing: ["0.16em", "0.03em", "0em", "0em", "0.08em"],
    cardX: [0, 0, 0, 0, 0],
    cardY: [130, 18, 0, 0, -92],
    cardScale: [0.78, 1.04, 1, 1, 0.9],
    cardRotateX: [18, 3, 0, 0, -12],
    cardRotateY: [0, 0, 0, 0, 0],
    cardRotateZ: [3, 0, 0, 0, -4],
  },
  {
    titleX: [-32, 8, 0, 0, 34],
    titleY: [-150, 24, 0, 0, -110],
    titleScale: [0.9, 1.04, 1, 1, 0.96],
    titleRotateX: [-28, 8, 0, 0, 18],
    titleRotateZ: [7, -2, 0, 0, -5],
    titleSkewX: [6, -1, 0, 0, -4],
    titleScaleX: [1, 1, 1, 1, 1],
    titleLetterSpacing: ["0.05em", "0.01em", "0em", "0em", "0.04em"],
    cardX: [-160, -18, 0, 0, 86],
    cardY: [54, 0, 0, 0, -40],
    cardScale: [0.88, 1.02, 1, 1, 0.92],
    cardRotateX: [0, 0, 0, 0, 0],
    cardRotateY: [16, 2, 0, 0, -10],
    cardRotateZ: [-4, 0, 0, 0, 3],
  },
  {
    titleX: [0, 0, 0, 0, 0],
    titleY: [18, 0, 0, 0, -26],
    titleScale: [1, 1, 1, 1, 0.98],
    titleRotateX: [0, 0, 0, 0, 0],
    titleRotateZ: [0, 0, 0, 0, 0],
    titleSkewX: [0, 0, 0, 0, 0],
    titleScaleX: [0.08, 1.12, 1, 1, 0.14],
    titleLetterSpacing: ["0.22em", "0.04em", "0em", "0em", "0.2em"],
    cardX: [0, 0, 0, 0, 0],
    cardY: [-118, -16, 0, 0, 86],
    cardScale: [0.84, 1.03, 1, 1, 0.88],
    cardRotateX: [-16, -3, 0, 0, 12],
    cardRotateY: [0, 0, 0, 0, 0],
    cardRotateZ: [-2, 0, 0, 0, 3],
  },
] as const;

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
  const supportingOpacity = useTransform(
    smoothProgress,
    [0.08, 0.28, 0.72, 0.92],
    [0, 1, 1, 0]
  );
  const supportingY = useTransform(
    smoothProgress,
    [0.08, 0.28, 0.72, 0.92],
    [48, 0, 0, -48]
  );
  const contentOpacity = useTransform(
    smoothProgress,
    [0.16, 0.34, 0.7, 0.9],
    [0, 1, 1, 0]
  );
  const levelIndex = index % levelMotionPresets.length;
  const motionPreset = levelMotionPresets[levelIndex];
  const titleRange = [0.05, 0.2, 0.32, 0.72, 0.94];
  const cardRange = [0.12, 0.26, 0.38, 0.7, 0.92];

  const titleOpacity = useTransform(
    smoothProgress,
    titleRange,
    [0, 0.85, 1, 1, 0]
  );
  const titleX = useTransform(smoothProgress, titleRange, motionPreset.titleX);
  const titleY = useTransform(smoothProgress, titleRange, motionPreset.titleY);
  const titleScale = useTransform(
    smoothProgress,
    titleRange,
    motionPreset.titleScale
  );
  const titleRotateX = useTransform(
    smoothProgress,
    titleRange,
    motionPreset.titleRotateX
  );
  const titleRotateZ = useTransform(
    smoothProgress,
    titleRange,
    motionPreset.titleRotateZ
  );
  const titleSkewX = useTransform(
    smoothProgress,
    titleRange,
    motionPreset.titleSkewX
  );
  const titleScaleX = useTransform(
    smoothProgress,
    titleRange,
    motionPreset.titleScaleX
  );
  const titleLetterSpacing = useTransform(
    smoothProgress,
    titleRange,
    motionPreset.titleLetterSpacing
  );
  const titleBlur = useTransform(
    smoothProgress,
    titleRange,
    [16, 2, 0, 0, 12]
  );
  const titleGlow = useTransform(
    smoothProgress,
    [0.08, 0.28, 0.68, 0.9],
    [0, 1, 1, 0]
  );
  const titleGlowRadius = useTransform(titleGlow, [0, 1], [0, 24]);
  const titleFilter = useMotionTemplate`blur(${titleBlur}px) drop-shadow(0 0 ${titleGlowRadius}px rgb(255 70 48 / 0.55))`;

  const contentX = useTransform(smoothProgress, cardRange, motionPreset.cardX);
  const contentY = useTransform(smoothProgress, cardRange, motionPreset.cardY);
  const contentScale = useTransform(
    smoothProgress,
    cardRange,
    motionPreset.cardScale
  );
  const contentRotateX = useTransform(
    smoothProgress,
    cardRange,
    motionPreset.cardRotateX
  );
  const contentRotateY = useTransform(
    smoothProgress,
    cardRange,
    motionPreset.cardRotateY
  );
  const contentRotateZ = useTransform(
    smoothProgress,
    cardRange,
    motionPreset.cardRotateZ
  );
  const contentBlur = useTransform(
    smoothProgress,
    cardRange,
    [12, 2, 0, 0, 10]
  );
  const contentFilter = useMotionTemplate`blur(${contentBlur}px)`;

  const maskProgress = useTransform(smoothProgress, [0.16, 0.36], [0, 1]);
  const clipPath = useTransform(maskProgress, (value) => {
    const hidden = Math.max(0, Math.min(100, (1 - value) * 100));

    if (levelIndex === 1) {
      return `inset(${hidden}% 0 0 0 round 1.25rem)`;
    }

    if (levelIndex === 2) {
      return `inset(0 0 0 ${hidden}% round 1.25rem)`;
    }

    if (levelIndex === 3) {
      const split = hidden / 2;
      return `inset(${split}% ${split}% ${split}% ${split}% round 1.25rem)`;
    }

    return `inset(0 ${hidden}% 0 0 round 1.25rem)`;
  });
  const maskOpacity = useTransform(maskProgress, [0, 0.3, 1], [0, 0.5, 1]);
  const effectOpacity = useTransform(
    smoothProgress,
    [0.04, 0.25, 0.68, 0.92],
    [0, 1, 0.85, 0]
  );
  const effectScale = useTransform(
    smoothProgress,
    [0.04, 0.28, 0.72, 0.94],
    [0.72, 1, 1.08, 0.9]
  );
  const effectRotate = useTransform(
    smoothProgress,
    [0.04, 0.94],
    levelIndex % 2 === 0 ? [-8, 8] : [8, -8]
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionMeta}
          style={
            shouldReduceMotion
              ? undefined
              : { opacity: supportingOpacity, y: supportingY }
          }
        >
          <span className={styles.sectionNumber}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.sectionRule} />
          <span className={styles.sectionCount}>
            {String(count).padStart(2, "0")}
          </span>
        </motion.div>

        {index === 0 && (
          <header className={styles.intro}>
            {shouldReduceMotion ? (
              <p className={styles.eyebrow}>{eyebrow}</p>
            ) : (
              <TypewriterText
                text={eyebrow}
                progress={smoothProgress}
                className={styles.eyebrow}
                startProgress={0.05}
                endProgress={0.15}
              />
            )}
            {shouldReduceMotion ? (
              <h2 className={styles.heading}>{title}</h2>
            ) : (
              <TypewriterText
                text={title}
                progress={smoothProgress}
                className={styles.heading}
                startProgress={0.08}
                endProgress={0.25}
              />
            )}
            {shouldReduceMotion ? (
              <p className={styles.description}>{description}</p>
            ) : (
              <TypewriterText
                text={description}
                progress={smoothProgress}
                className={styles.description}
                startProgress={0.15}
                endProgress={0.35}
              />
            )}
          </header>
        )}

        <div className={styles.story}>
          <motion.div
            className={`${styles.levelEffect} ${styles[levelEffectClasses[levelIndex]]}`}
            style={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: effectOpacity,
                    scale: effectScale,
                    rotate: effectRotate,
                  }
            }
            aria-hidden="true"
          />
          {shouldReduceMotion ? (
            <h3 className={styles.storyTitle}>{item.title}</h3>
          ) : (
            <TypewriterText
              text={item.title}
              progress={smoothProgress}
              className={styles.storyTitle}
              startProgress={0.08}
              endProgress={0.28}
            />
          )}
          <motion.div
            className={styles.storyContent}
            style={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: contentOpacity,
                    x: contentX,
                    y: contentY,
                    scale: contentScale,
                    rotateX: contentRotateX,
                    rotateY: contentRotateY,
                    rotateZ: contentRotateZ,
                    filter: contentFilter,
                    clipPath,
                  }
            }
          >
            <motion.div 
              style={
                shouldReduceMotion 
                  ? undefined 
                  : { opacity: maskOpacity }
              }
            >
              {item.content}
            </motion.div>
          </motion.div>
        </div>
      </div>
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
