import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { X, Calendar, User, Clock, Hash, Tag, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIssue } from "@/lib/dataClient";
import { openIssueIdAtom } from "@/atoms/tableState";
import { cn } from "@/lib/utils";

const priorityColors = {
  Low: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
  Medium:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
  High: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300",
  Urgent:
    "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  Todo: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300",
  "In Progress":
    "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
  "In Review":
    "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300",
  Done: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
  Backlog:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
};

export const IssueDetailSheet: React.FC = () => {
  const [openIssueId, setOpenIssueId] = useAtom(openIssueIdAtom);
  const { data: issue, isLoading, error } = useIssue(openIssueId);

  const isOpen = !!openIssueId;

  const handleClose = () => {
    setOpenIssueId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SheetHeader className="space-y-4 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isLoading ? (
                      <Skeleton className="h-6 w-24 mb-2" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Hash className="h-4 w-4" />
                        {issue?.identifier}
                      </div>
                    )}
                    <SheetTitle className="text-xl leading-tight">
                      {isLoading ? (
                        <Skeleton className="h-7 w-full" />
                      ) : (
                        issue?.title
                      )}
                    </SheetTitle>
                  </div>
                </div>
              </SheetHeader>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200">
                    Failed to load issue details
                  </span>
                </motion.div>
              )}

              {isLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ) : issue ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground mr-2">
                        Status
                      </label>
                      <Badge
                        className={cn(
                          "justify-start",
                          statusColors[
                            issue.status as keyof typeof statusColors
                          ]
                        )}
                      >
                        {issue.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground mr-2">
                        Priority
                      </label>
                      <Badge
                        className={cn(
                          "justify-start",
                          priorityColors[
                            issue.priority as keyof typeof priorityColors
                          ]
                        )}
                      >
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Assignee
                      </label>
                      <div className="text-sm">{issue.assignee}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Project
                      </label>
                      <div className="text-sm">{issue.project}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Due Date
                        </label>
                        <div className="text-sm">
                          {formatDate(issue.dueDate)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Estimate
                        </label>
                        <div className="text-sm">{issue.estimate}h</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Created
                        </label>
                        <div className="text-sm">
                          {formatDate(issue.createdAt)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Updated
                        </label>
                        <div className="text-sm">
                          {formatDate(issue.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground mr-2">
                      Cycle
                    </label>
                    <Badge variant="outline">{issue.cycle}</Badge>
                  </div>

                  {issue.labels.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Labels
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {issue.labels.map((label, index) => (
                          <motion.div
                            key={label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Badge variant="secondary">{label}</Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <div className="text-sm leading-relaxed p-3 bg-muted/50 rounded-lg">
                      {issue.description}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
