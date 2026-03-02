
"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import type { Region } from "@/lib/types";

export interface RegionalCampusData {
  campus: string;
  attendance: number;
  reported: number;
  ratio: number;
  change: number;
  region: string;
}

interface RegionalCampusSummaryTableProps {
  data: RegionalCampusData[];
  regions: Region[];
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function RegionalCampusSummaryTable({
  data,
  regions,
  isLoading,
}: RegionalCampusSummaryTableProps) {
  const groupedData = React.useMemo(() => {
    const dataByRegion: { [key: string]: RegionalCampusData[] } = {};

    data.forEach((campusData) => {
      const region = campusData.region;
      if (!dataByRegion[region]) {
        dataByRegion[region] = [];
      }
      dataByRegion[region].push(campusData);
    });

    const regionOrderMap = new Map(regions.map(r => [r.name, r.order]));

    const sortedRegions = Object.keys(dataByRegion).sort((a, b) => {
        const orderA = regionOrderMap.get(a) ?? Infinity;
        const orderB = regionOrderMap.get(b) ?? Infinity;

        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        
        if (orderA === orderB) {
            return a.localeCompare(b);
        }
        return orderA - orderB;
    });

    const sortedGroupedData: { [key: string]: RegionalCampusData[] } = {};
    sortedRegions.forEach((region) => {
      sortedGroupedData[region] = dataByRegion[region];
    });

    return sortedGroupedData;
  }, [data, regions]);

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : Object.keys(groupedData).length > 0 ? (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={Object.keys(groupedData)}
          >
            {Object.entries(groupedData).map(([region, campusItems]) => (
              <AccordionItem value={region} key={region} className="border-b-0">
                <AccordionTrigger className="text-lg font-medium p-6 border-b">
                  {region}
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CAMPUS</TableHead>
                        <TableHead className="text-right">Attendance</TableHead>
                        <TableHead className="text-right">Reported</TableHead>
                        <TableHead className="text-right">
                          Ratio per Giver
                        </TableHead>
                        <TableHead className="text-right">CHG%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campusItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.campus}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.attendance.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.reported > 0
                              ? formatCurrency(item.reported)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.ratio > 0 ? formatCurrency(item.ratio) : "-"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right flex items-center justify-end gap-1",
                              item.change > 0
                                ? "text-green-600"
                                : item.change < 0
                                ? "text-red-600"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.change !== 0 &&
                              (item.change > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              ))}
                            {item.change.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground p-10">
            No campus data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
