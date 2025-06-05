import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Users,
  ChevronRight,
  Calendar,
  Hash,
  User,
  Clock,
  Ban,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Issue } from "@/types/Issue";
import { useIssues } from "@/lib/dataClient";
import { useDebounce } from "@/hooks/useDebounce";
import {
  searchAtom,
  sortFieldAtom,
  sortDirectionAtom,
  filtersAtom,
  groupByAtom,
  pageAtom,
  pageSizeAtom,
  openIssueIdAtom,
} from "@/atoms/tableState";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Issue>();

const priorityColors = {
  Low: "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Medium:
    "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  High: "bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Urgent:
    "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  Todo: "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  "In Progress":
    "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "In Review":
    "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Done: "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300",
  Backlog:
    "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export const IssuesTable: React.FC = () => {
  const { data: issues = [], isLoading, error } = useIssues();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [search, setSearch] = useAtom(searchAtom);
  const [sortField, setSortField] = useAtom(sortFieldAtom);
  const [sortDirection, setSortDirection] = useAtom(sortDirectionAtom);
  const [filters, setFilters] = useAtom(filtersAtom);
  const [groupBy, setGroupBy] = useAtom(groupByAtom);
  const [page, setPage] = useAtom(pageAtom);
  const [pageSize, setPageSize] = useAtom(pageSizeAtom);
  const [, setOpenIssueId] = useAtom(openIssueIdAtom);

  const debouncedSearch = useDebounce(search, 300);

  const filterOptions = useMemo(() => {
    const statuses = [...new Set(issues.map((issue) => issue.status))];
    const projects = [...new Set(issues.map((issue) => issue.project))];
    const priorities = [...new Set(issues.map((issue) => issue.priority))];
    const assignees = [...new Set(issues.map((issue) => issue.assignee))];
    const cycles = [...new Set(issues.map((issue) => issue.cycle))];

    return { statuses, projects, priorities, assignees, cycles };
  }, [issues]);

  const filteredData = useMemo(() => {
    return issues.filter((issue) => {
      const searchMatch =
        !debouncedSearch ||
        issue.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        issue.identifier.toLowerCase().includes(debouncedSearch.toLowerCase());

      const statusMatch =
        filters.status.length === 0 || filters.status.includes(issue.status);
      const projectMatch =
        filters.project.length === 0 || filters.project.includes(issue.project);
      const priorityMatch =
        filters.priority.length === 0 ||
        filters.priority.includes(issue.priority);
      const assigneeMatch =
        filters.assignee.length === 0 ||
        filters.assignee.includes(issue.assignee);
      const cycleMatch =
        filters.cycle.length === 0 || filters.cycle.includes(issue.cycle);

      return (
        searchMatch &&
        statusMatch &&
        projectMatch &&
        priorityMatch &&
        assigneeMatch &&
        cycleMatch
      );
    });
  }, [issues, debouncedSearch, filters]);

  const clearAllFilters = () => {
    setFilters({
      status: [],
      priority: [],
      project: [],
      assignee: [],
      cycle: [],
    });
    setSearch("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("identifier", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isCurrentSort = sortField === "identifier";
              setSortField("identifier");
              setSortDirection(
                isCurrentSort && sortDirection === "asc" ? "desc" : "asc"
              );
            }}
            className="h-auto p-0 font-medium"
          >
            <Hash className="mr-2 h-4 w-4" />
            ID
            {sortField === "identifier" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
        ),
        cell: ({ getValue }) => (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {getValue()}
          </code>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: ({ getValue, row }) => (
          <div className="max-w-md">
            <div className="font-medium truncate">{getValue()}</div>
            {row.original.labels.length > 0 && (
              <div className="flex gap-1 mt-1">
                {row.original.labels.slice(0, 2).map((label, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
                {row.original.labels.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{row.original.labels.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge
            className={cn(
              statusColors[getValue() as keyof typeof statusColors]
            )}
          >
            {getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("priority", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isCurrentSort = sortField === "priority";
              setSortField("priority");
              setSortDirection(
                isCurrentSort && sortDirection === "asc" ? "desc" : "asc"
              );
            }}
            className="h-auto p-0 font-medium"
          >
            Priority
            {sortField === "priority" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
        ),
        cell: ({ getValue }) => (
          <Badge
            className={cn(
              priorityColors[getValue() as keyof typeof priorityColors]
            )}
          >
            {getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("assignee", {
        header: () => (
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Assignee
          </div>
        ),
        cell: ({ getValue }) => (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium mr-2">
              {getValue()
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            {getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("project", {
        header: "Project",
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor("cycle", {
        header: "Cycle",
        cell: ({ getValue, row }) => (
          <div className="max-w-md">
            <div className="font-medium truncate">{getValue()}</div>
          </div>
        ),
      }),
      columnHelper.accessor("dueDate", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isCurrentSort = sortField === "dueDate";
              setSortField("dueDate");
              setSortDirection(
                isCurrentSort && sortDirection === "asc" ? "desc" : "asc"
              );
            }}
            className="h-auto p-0 font-medium"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Due Date
            {sortField === "dueDate" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
        ),
        cell: ({ getValue }) => formatDate(getValue()),
      }),
      columnHelper.accessor("estimate", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => {
              const isCurrentSort = sortField === "estimate";
              setSortField("estimate");
              setSortDirection(
                isCurrentSort && sortDirection === "asc" ? "desc" : "asc"
              );
            }}
            className="h-auto p-0 font-medium"
          >
            <Clock className="mr-2 h-4 w-4" />
            Estimate
            {sortField === "estimate" &&
              (sortDirection === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
        ),
        cell: ({ getValue }) => `${getValue()}h`,
      }),
    ],
    [sortField, sortDirection, setSortField, setSortDirection]
  );

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  const groupedData = useMemo(() => {
    if (!groupBy) return sortedData;

    const groups: { [key: string]: Issue[] } = {};
    sortedData.forEach((issue) => {
      const groupKey = issue[groupBy] as string;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(issue);
    });

    return groups;
  }, [sortedData, groupBy]);

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const table = useReactTable({
    data: groupBy ? [] : sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(sortedData.length / pageSize),
    state: {
      pagination: {
        pageIndex: page,
        pageSize: pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page, pageSize: pageSize });
        setPage(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
  });

  const paginatedData = useMemo(() => {
    if (groupBy) return groupedData;

    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, groupedData, groupBy, page, pageSize]);

  const FilterPopover = ({
    title,
    options,
    selected,
    onSelectionChange,
  }: {
    title: string;
    options: string[];
    selected: string[];
    onSelectionChange: (values: string[]) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="border-dashed">
            <Filter className="mr-2 h-4 w-4" />
            {title}
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selected.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 bg-popover z-50" align="start">
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectionChange([...selected, option]);
                    } else {
                      onSelectionChange(selected.filter((s) => s !== option));
                    }
                  }}
                />
                <label
                  htmlFor={option}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectionChange([]);
                  setIsOpen(false);
                }}
                className="w-full"
              >
                Clear filters
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">
            Failed to load issues
          </div>
          <div className="text-sm text-muted-foreground">
            Please try again later
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search issues by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterPopover
            title="Status"
            options={filterOptions.statuses}
            selected={filters.status}
            onSelectionChange={(values) =>
              setFilters({ ...filters, status: values })
            }
          />
          <FilterPopover
            title="Priority"
            options={filterOptions.priorities}
            selected={filters.priority}
            onSelectionChange={(values) =>
              setFilters({ ...filters, priority: values })
            }
          />
          <FilterPopover
            title="Project"
            options={filterOptions.projects}
            selected={filters.project}
            onSelectionChange={(values) =>
              setFilters({ ...filters, project: values })
            }
          />
          <FilterPopover
            title="Assignee"
            options={filterOptions.assignees}
            selected={filters.assignee}
            onSelectionChange={(values) =>
              setFilters({ ...filters, assignee: values })
            }
          />
          <FilterPopover
            title="Cycle"
            options={filterOptions.cycles}
            selected={filters.cycle}
            onSelectionChange={(values) =>
              setFilters({ ...filters, cycle: values })
            }
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Ban />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Clear all filters
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Group by:</span>
          <Select
            value={groupBy || "none"}
            onValueChange={(value) => {
              setGroupBy(value === "none" ? null : (value as keyof Issue));
              setExpandedGroups(new Set());
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="assignee">Assignee</SelectItem>
              <SelectItem value="cycle">Cycle</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredData.length} of {issues.length} issues
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {groupBy
                ? Object.entries(groupedData).map(([groupKey, groupIssues]) => (
                    <React.Fragment key={groupKey}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-muted/50 cursor-pointer hover:bg-muted/70"
                        onClick={() => toggleGroupExpansion(groupKey)}
                      >
                        <TableCell
                          colSpan={columns.length}
                          className="px-4 py-3"
                        >
                          <div className="flex items-center gap-2 font-medium">
                            <motion.div
                              animate={{
                                rotate: expandedGroups.has(groupKey) ? 90 : 0,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                            {groupKey} ({groupIssues.length})
                          </div>
                        </TableCell>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedGroups.has(groupKey) &&
                          groupIssues
                            .slice(page * pageSize, (page + 1) * pageSize)
                            .map((issue, index) => (
                              <motion.tr
                                key={issue.identifier}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setOpenIssueId(issue.identifier)}
                              >
                                {columns.map((column, cellIndex) => (
                                  <TableCell
                                    key={cellIndex}
                                    className="px-4 py-3"
                                  >
                                    {flexRender(column.cell, {
                                      getValue: () =>
                                        issue[
                                          column.accessorKey as keyof Issue
                                        ],
                                      row: { original: issue },
                                    } as any)}
                                  </TableCell>
                                ))}
                              </motion.tr>
                            ))}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                : (Array.isArray(paginatedData) ? paginatedData : []).map(
                    (issue, index) => (
                      <motion.tr
                        key={issue.identifier}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setOpenIssueId(issue.identifier)}
                      >
                        {columns.map((column, cellIndex) => (
                          <TableCell key={cellIndex} className="px-4 py-3">
                            {flexRender(column.cell, {
                              getValue: () =>
                                issue[column.accessorKey as keyof Issue],
                              row: { original: issue },
                            } as any)}
                          </TableCell>
                        ))}
                      </motion.tr>
                    )
                  )}
            </AnimatePresence>

            {(groupBy
              ? Object.values(groupedData).flat()
              : Array.isArray(paginatedData)
              ? paginatedData
              : []
            ).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  <div className="text-muted-foreground">
                    {debouncedSearch ||
                    Object.values(filters).some((f) => f.length > 0)
                      ? "No issues match your filters"
                      : "No issues found"}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!groupBy && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="bg-popover z-50">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="text-sm font-medium">
              Page {page + 1} of{" "}
              {Math.max(1, Math.ceil(filteredData.length / pageSize))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <span className="sr-only">Go to first page</span>⇤
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <span className="sr-only">Go to previous page</span>⇠
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(filteredData.length / pageSize) - 1}
              >
                <span className="sr-only">Go to next page</span>⇢
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setPage(Math.ceil(filteredData.length / pageSize) - 1)
                }
                disabled={page >= Math.ceil(filteredData.length / pageSize) - 1}
              >
                <span className="sr-only">Go to last page</span>⇥
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
