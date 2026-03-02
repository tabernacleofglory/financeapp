
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends UserProfile, TValue>({
  columns,
  data,
  isLoading,
  onRowClick,
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
  
  const handleRowClick = (e: React.MouseEvent, row: any) => {
    // Prevent row click when clicking on buttons or dropdowns inside the row
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    onRowClick?.(row.original as TData);
  }

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
            <Card key={row.id} onClick={(e) => handleRowClick(e, row)} className={cn(onRowClick && 'cursor-pointer')}>
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
                        onClick={(e) => handleRowClick(e, row)}
                        className={cn(onRowClick && 'cursor-pointer')}
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
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                  table.setPageSize(Number(value))
                  }}
              >
                  <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                      </SelectItem>
                  ))}
                  </SelectContent>
              </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                  <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                  >
                      <span className="sr-only">Go to previous page</span>
                      <svg className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                  </Button>
                  <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                  >
                      <span className="sr-only">Go to next page</span>
                      <svg className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                  </Button>
              </div>
          </div>
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
            const filterValue = event.target.value;
            table.getColumn('name')?.setFilterValue(filterValue);
            table.getColumn('email')?.setFilterValue(filterValue);
          }}
          className="max-w-sm"
        />
      </div>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
}
