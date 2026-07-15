import './MadeByUnknw.css'

/**
 * "made by UNKNW" studio credit. The block-letter UNKNW wordmark is the
 * canonical mark ported verbatim from the unknw.com site (components/layout/
 * Logo.tsx, viewBox 0 0 140 35); it fills with currentColor so it inherits
 * whatever muted footer tone it's dropped into and brightens on hover. Kept
 * deliberately quiet — a secondary credit, not a headline.
 */
export default function MadeByUnknw({ className = '' }) {
  return (
    <a
      className={`madeby${className ? ` ${className}` : ''}`}
      href="https://unknw.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Made by UNKNW — opens unknw.com in a new tab"
    >
      <span className="madeby__by cap-trim">made by</span>
      <svg
        className="madeby__mark"
        viewBox="0 0 140 35"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M10.667 5.37695V21.3535L12.2754 23.3008H20.5996L21.5557 21.7578V5.37695L26.8887 0H30.8086L46.8896 20.5615V0H52.2227L57.5557 5.37695V8.7373H72.666V19.4912H65.6826L69.5186 23.3008H76.666V5.37695L82 0H86.6416L101.777 17.4395V0H112.444V15.9443L116.592 10.2568H125.186L129.333 15.9443V0H140V28.6777L134.667 34.0547H129.302L120.889 22.5195L112.476 34.0547H102.024L87.333 17.127V28.6777L82 34.0547H65.1475L57.5557 26.5156V28.6777L52.2227 34.0547H43.8584L32.2227 19.1758V24.8428L26.5117 34.0547H7.28027L0 25.2471V0H5.33301L10.667 5.37695Z"
          fill="currentColor"
        />
      </svg>
    </a>
  )
}
