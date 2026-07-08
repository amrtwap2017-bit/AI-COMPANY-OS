# Tables — Data Table Patterns

All data tables use a shared DataTable component built on @tanstack/react-table with sorting, filtering, pagination, and column visibility.

## DataTable Component

`	ypescript
// src/components/data-table/data-table.tsx
'use client';

import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, type ColumnDef, type SortingState } from '@tanstack/react-table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageCount: number;
  onPaginationChange: (page: number) => void;
  isLoading?: boolean;
}

export function DataTable<TData>({ columns, data, pageCount, onPaginationChange, isLoading }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <DataTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    <DataTableColumnHeader header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} onPageChange={onPaginationChange} />
    </div>
  );
}
`

## Column Definition Pattern

`	ypescript
export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'guestName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Guest" />,
    cell: ({ row }) => <span className="font-medium">{row.original.guestName}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'checkIn',
    header: 'Check In',
    cell: ({ row }) => formatDate(row.original.checkIn),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger>...</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
`

## Table Features

| Feature         | Implementation                             |
| --------------- | ------------------------------------------ |
| Column sorting  | getSortedRowModel() — click header to sort |
| Global search   | globalFilter — search across all columns |
| Column filters  | Per-column setFilterValue for specific columns |
| Pagination      | Server-side manualPagination with page count |
| Row selection   | Checkbox column with getSelectedRowModel() |
| Column visibility | Toggle via dropdown menu                 |
| Export          | Download as CSV via 	able.getRowModel().rows |
| Loading state   | TableSkeleton component with matching column count |
| Empty state     | Centered EmptyState with optional CTA    |
| Responsive      | Horizontal scroll on mobile, sticky first column |

## Tables in V1

| Table            | Page            | Columns                                                         |
| ---------------- | --------------- | --------------------------------------------------------------- |
| Bookings         | /bookings     | Guest, Property, Check In, Check Out, Status, Total, Actions    |
| Properties       | /properties   | Name, Type, Max Guests, Base Rate, Status, Actions              |
| Guests           | /guests       | Name, Email, Phone, Nationality, Total Stays, Actions           |
| Users            | /settings/users| Name, Email, Role, Last Login, Status, Actions                 |
| Payments         | /finance/payments| ID, Guest, Amount, Method, Status, Date, Actions              |
| Invoices         | /finance/invoices| Number, Guest, Amount, Status, Due Date, Actions              |
| Housekeeping     | /housekeeping | Room, Status, Assigned To, Priority, Due Time, Actions          |
