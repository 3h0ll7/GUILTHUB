export enum GuiltLevel {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  EXTREME = 4,
}

export interface GuiltAnalysis {
  severity: number; // 1-4
  category: string;
  roast: string;
  penance: string;
  tags: string[];
}

export interface GuiltCommit {
  id: string;
  date: string; // ISO string
  message: string;
  analysis: GuiltAnalysis;
  timestamp: number;
  issueId?: string; // Optional link to an issue
}

export interface DayData {
  date: string;
  count: number;
  level: GuiltLevel;
}

export interface PRReview {
  status: 'merged' | 'open';
  comment: string;
  label: string;
}

export interface PullRequest {
  id: string;
  commitId: string;
  number: number;
  title: string;
  description: string;
  status: 'open' | 'merged' | 'closed';
  createdAt: string;
  review?: PRReview;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  description: string;
  status: 'open' | 'closed';
  createdAt: string;
  labels: string[];
}