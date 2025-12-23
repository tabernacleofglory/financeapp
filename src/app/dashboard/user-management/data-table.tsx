
'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import type { UserProfile } from '@/lib/types';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
}

export function DataTable<TData extends UserProfile, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const isMobile = useIsMobile();

  const renderMobileView = () => (
    <div className="grid gap-4">
      {isLoading ? (
         [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                 <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
      ) : table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
            <Card key={row.id}>
              <CardContent className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {row.getVisibleCells().map((cell) => {
                    const column = cell.column.columnDef as any;
                    const isActionsCell = cell.column.id === 'actions';
                    if (isActionsCell) return null; // Skip rendering actions in the grid

                    // Manually render Name and Email to ensure they are on top
                    if (cell.column.id === 'name') {
                        return (
                             <div key={cell.id} className="col-span-2 font-semibold text-lg">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                        )
                    }
                    if (cell.column.id === 'email') {
                         return (
                             <div key={cell.id} className="col-span-2 text-muted-foreground -mt-2 mb-2">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                         )
                    }
                    
                    return (
                        <div key={cell.id}>
                             <div className="text-sm text-muted-foreground">{column.header}</div>
                             <div className="font-medium">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </div>
                    )
                })}
                 <div className="col-span-2 flex justify-end items-center -mr-4 -mb-4">
                  {row.getVisibleCells().map((cell) => {
                     if (cell.column.id === 'actions') {
                       return (
                         <div key={`${cell.id}-action`}>
                           {flexRender(cell.column.columnDef.cell, cell.getContext())}
                         </div>
                       );
                     }
                     return null;
                   })}
                 </div>
              </CardContent>
            </Card>
        ))
      ) : (
        <div className="text-center py-10">No results.</div>
      )}
    </div>
  );

  const renderDesktopView = () => (
     <div className="rounded-lg border bg-card">
        <div className="overflow-auto">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    );
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading
                ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={columns.length}>
                        <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                    ))
                : table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                    >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                            )}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                : (
                    <TableRow>
                        <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                        >
                        No results.
                        </TableCell>
                    </TableRow>
                    )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 p-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            Previous
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            Next
            </Button>
        </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center p-4 pl-0 md:p-4">
        <Input
          placeholder="Filter by name or email..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => {
            table.getColumn('name')?.setFilterValue(event.target.value);
            table.getColumn('email')?.setFilterValue(event.target.value);
          }}
          className="max-w-sm"
        />
      </div>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
