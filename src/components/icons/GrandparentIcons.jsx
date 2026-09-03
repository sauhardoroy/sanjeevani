import React from 'react';

/**
 * GrandmotherIcon — Minimalist Black & White Flat Vector Icon
 * Distinguished by a classic top hair bun, gentle side-swept hair waves, and bust.
 */
export function GrandmotherIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Hair Bun on top */}
      <circle cx="12" cy="4" r="2.2" fill="currentColor" stroke="none" />
      {/* Head */}
      <circle cx="12" cy="11" r="4.2" />
      {/* Wavy hair contour */}
      <path d="M7.8 11c0-2.3 1.9-4.2 4.2-4.2s4.2 1.9 4.2 4.2" />
      {/* Shoulders */}
      <path d="M6 20.5v-1a6 6 0 0 1 12 0v1" />
    </svg>
  );
}

/**
 * GrandfatherIcon — Minimalist Black & White Flat Vector Icon
 * Distinguished by elder side-parted hair, classic round spectacles, and bust.
 */
export function GrandfatherIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head */}
      <circle cx="12" cy="10.5" r="4.2" />
      {/* Side parted hair contour */}
      <path d="M8 9.5c.6-2.2 2-3.5 4-3.5s3.4 1.3 4 3.5" />
      {/* Classic Round Spectacles & Bridge */}
      <circle cx="10" cy="10.8" r="1.4" />
      <circle cx="14" cy="10.8" r="1.4" />
      <path d="M11.4 10.8h1.2" />
      {/* Shoulders */}
      <path d="M6 20.5v-1a6 6 0 0 1 12 0v1" />
    </svg>
  );
}
