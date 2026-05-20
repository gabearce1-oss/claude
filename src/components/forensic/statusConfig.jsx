// Shared status/color config for the forensic intelligence layer

export const CLAIM_STATUS = {
  verified:        { label: 'Verified',         color: '#4a5d3a', bg: '#e8efe2' },
  corroborated:    { label: 'Corroborated',     color: '#5d7a3a', bg: '#edf2e0' },
  plausible:       { label: 'Plausible',        color: '#5a6b7a', bg: '#e0e6ec' },
  weak_lead:       { label: 'Weak Lead',        color: '#8a6e3c', bg: '#f3ead8' },
  fabricated_risk: { label: 'Fabricated Risk',  color: '#6b1f1f', bg: '#f3dede' },
  rejected:        { label: 'Rejected',         color: '#3a3530', bg: '#e8e0d0' },
  unverified:      { label: 'Unverified',       color: '#6b6559', bg: '#ebe1ce' },
};

export const CLAIM_TYPES = [
  'identity', 'kinship', 'property', 'financial', 'military',
  'legal', 'archival', 'geographic', 'oral_history', 'timeline', 'other'
];

export const SUPPORT_ROLES = {
  supports:        { label: 'Supports',         color: '#4a5d3a' },
  contradicts:     { label: 'Contradicts',      color: '#6b1f1f' },
  mentions:        { label: 'Mentions',         color: '#8a7b6f' },
  contextualizes:  { label: 'Contextualizes',   color: '#5a6b7a' },
  duplicates:      { label: 'Duplicates',       color: '#6b6559' },
  derived_from:    { label: 'Derived From',     color: '#5a4d3a' },
};

export const REQUEST_STATUS = {
  planned:    { label: 'Planned',    color: '#6b6559' },
  draft:      { label: 'Draft',      color: '#8a7b6f' },
  submitted:  { label: 'Submitted',  color: '#5a6b7a' },
  running:    { label: 'Running',    color: '#5a6b7a' },
  responded:  { label: 'Responded',  color: '#8a6e3c' },
  completed:  { label: 'Completed',  color: '#4a5d3a' },
  blocked:    { label: 'Blocked',    color: '#6b1f1f' },
  no_result:  { label: 'No Result',  color: '#3a3530' },
};

export const ARCHIVE_SOURCES = [
  'AGN', 'AHES', 'HNDM', 'Chronicling America', 'Library of Congress',
  'FamilySearch', 'UNISON', 'COLSON', 'Bancroft',
  'U Arizona Special Collections', 'NARA', 'Wells Fargo Archives', 'Other'
];