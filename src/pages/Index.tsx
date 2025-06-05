import React from "react";
import { Provider } from "jotai";
import { motion } from "framer-motion";
import { Bug, GitBranch, Users, Calendar } from "lucide-react";

import { IssuesTable } from "@/components/IssuesTable";
import { IssueDetailSheet } from "@/components/IssueDetailSheet";
import { DarkModeToggle } from "@/components/DarkModeToggle";

import { useURLSync } from "@/hooks/useURLSync";
import { useIssues } from "@/lib/dataClient";

const DashboardStats: React.FC = () => {
  const { data: issues = [] } = useIssues();

  const stats = React.useMemo(() => {
    const total = issues.length;
    const inProgress = issues.filter((i) => i.status === "In Progress").length;
    const done = issues.filter((i) => i.status === "Done").length;
    const urgent = issues.filter((i) => i.priority === "Urgent").length;

    return { total, inProgress, done, urgent };
  }, [issues]);

  const statCards = [
    {
      title: "Total Issues",
      value: stats.total,
      icon: Bug,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: GitBranch,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
    {
      title: "Completed",
      value: stats.done,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Urgent",
      value: stats.urgent,
      icon: Calendar,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-lg border ${stat.bgColor} transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const DashboardContent: React.FC = () => {
  useURLSync();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Issue Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage and track your project issues
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <DarkModeToggle />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DashboardStats />
          <div className="bg-card rounded-lg border p-6">
            <IssuesTable />
          </div>
        </motion.div>
      </main>

      <IssueDetailSheet />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <Provider>
      <DashboardContent />
    </Provider>
  );
};

export default Index;
