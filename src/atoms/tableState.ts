import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { TableState, Issue } from "@/types/Issue";

const defaultTableState: TableState = {
  search: "",
  sortField: null,
  sortDirection: "asc",
  filters: {
    status: [],
    project: [],
    priority: [],
    assignee: [],
    cycle: [],
  },
  groupBy: null,
  page: 0,
  pageSize: 10,
  openIssueId: null,
};

export const searchAtom = atomWithStorage(
  "issues-search",
  defaultTableState.search
);
export const sortFieldAtom = atomWithStorage(
  "issues-sort-field",
  defaultTableState.sortField
);
export const sortDirectionAtom = atomWithStorage(
  "issues-sort-direction",
  defaultTableState.sortDirection
);
export const filtersAtom = atomWithStorage(
  "issues-filters",
  defaultTableState.filters
);
export const groupByAtom = atomWithStorage(
  "issues-groupBy",
  defaultTableState.groupBy
);
export const pageAtom = atomWithStorage("issues-page", defaultTableState.page);
export const pageSizeAtom = atomWithStorage(
  "issues-pageSize",
  defaultTableState.pageSize
);
export const openIssueIdAtom = atomWithStorage(
  "issues-openIssueId",
  defaultTableState.openIssueId
);

export const darkModeAtom = atomWithStorage("dark-mode", false);

export const tableStateAtom = atom(
  (get) => ({
    search: get(searchAtom),
    sortField: get(sortFieldAtom),
    sortDirection: get(sortDirectionAtom),
    filters: get(filtersAtom),
    groupBy: get(groupByAtom),
    page: get(pageAtom),
    pageSize: get(pageSizeAtom),
    openIssueId: get(openIssueIdAtom),
  }),
  (get, set, newState: Partial<TableState>) => {
    if (newState.search !== undefined) set(searchAtom, newState.search);
    if (newState.sortField !== undefined)
      set(sortFieldAtom, newState.sortField);
    if (newState.sortDirection !== undefined)
      set(sortDirectionAtom, newState.sortDirection);
    if (newState.filters !== undefined) set(filtersAtom, newState.filters);
    if (newState.groupBy !== undefined) set(groupByAtom, newState.groupBy);
    if (newState.page !== undefined) set(pageAtom, newState.page);
    if (newState.pageSize !== undefined) set(pageSizeAtom, newState.pageSize);
    if (newState.openIssueId !== undefined)
      set(openIssueIdAtom, newState.openIssueId);
  }
);
