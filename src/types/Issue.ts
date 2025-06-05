
export interface Issue {
  identifier: string;
  title: string;
  labels: string[];
  project: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  cycle: string;
  estimate: number;
}

export type SortDirection = 'asc' | 'desc';

export interface TableState {
  search: string;
  sortField: keyof Issue | null;
  sortDirection: SortDirection;
  filters: {
    status: string[];
    project: string[];
    priority: string[];
    assignee: string[];
    cycle: string[];
  };
  groupBy: keyof Issue | null;
  page: number;
  pageSize: number;
  openIssueId: string | null;
}
