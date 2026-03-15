"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { Breadcrumbs } from "./breadcrumbs";
import { motion } from "framer-motion";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function MainLayout({ children, title, description }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-[280px]">
        <TopBar />
        
        <main className="p-8">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Page Header */}
          {title && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-gray-500 font-light">{description}</p>
              )}
            </motion.div>
          )}

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
