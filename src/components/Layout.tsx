import React from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className = "" }: LayoutProps) => {
  return (
    <>
      <Navigation />
      <main className={`pt-24 ${className}`}>
        {children}
      </main>
    </>
  );
};

export default Layout;