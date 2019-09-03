export const COLLECTION_STATS_PAGEVISITS = 'pagevisits';
export const COLLECTION_STATS_USERVISITS = 'userpagevisits';
export const COLLECTION_STATS_DAILYVISITS = 'dailysitevisits';


// We want only store a counter on which page is loaded. For that we want to trace the unique visit on an url.
export interface UserPageVisit {
  ip: string;
  url: string;
  _id?: string;
}

export interface UniquePageVisit {
  url: string;
  count: number;
  _id?: string;
}

// We want to count the page number seen on our website per day and we want to know how many people has visited our website
export interface DailySiteVisit {
  ip: string;
  day: string;
  count: number;
  _id?: string;
}
