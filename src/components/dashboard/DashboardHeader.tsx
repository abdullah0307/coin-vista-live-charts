
import React from "react";

interface DashboardHeaderProps {
  lastUpdated: Date;
}

const DashboardHeader = ({ lastUpdated }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">CoinVista Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Live cryptocurrency market data
        </p>
      </div>
      <div className="mt-4 lg:mt-0 text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DashboardHeader;
