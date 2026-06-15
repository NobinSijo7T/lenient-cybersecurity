'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Instagram,
  Twitter,
  Linkedin,
  ArrowUpRight,
} from 'lucide-react'
import styles from './Footer.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    // Entrance animation on scroll
    gsap.from(footer.children, {
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    })
  }, [])

  const currentYear = new Date().getFullYear()

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Courses', href: '#courses' },
    { label: 'Projects', href: '#projects' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/lenient_tree?igsh=ZmV4ajVlNGhhNW52',
    },
    { icon: Twitter, label: 'X', href: 'https://x.com/lenienttree' },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/lenient-tree/',
    },
  ]

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Logo & Description */}
          <div className={styles.brandSection}>
            <div className={styles.logoWrapper}>
              <img
                src="/white.png"
                alt="Lenient Cyber"
                className={styles.logo}
              />
            </div>
            <p className={styles.description}>
              Master cybersecurity through hands-on training and real-world
              projects. Join our community of ethical hackers and security
              professionals.
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className={styles.socialIcon} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.linksTitle}>Quick Links</h3>
            <nav className={styles.linksList}>
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className={styles.link}>
                  {link.label}
                  <ArrowUpRight className={styles.linkIcon} />
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {currentYear} Lenient Cyber. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <a href="#privacy" className={styles.legalLink}>
              Privacy Policy
            </a>
            <span className={styles.separator}>•</span>
            <a href="#terms" className={styles.legalLink}>
              Terms of Service
            </a>
            <span className={styles.separator}>•</span>
            <a href="#cookies" className={styles.legalLink}>
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={styles.glowEffect} aria-hidden="true" />
    </footer>
  )
}
