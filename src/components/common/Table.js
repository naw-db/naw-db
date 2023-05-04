import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Checkbox,
  CssBaseline,
  ListItemText,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ThemeProvider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { matchSorter } from "match-sorter";
import React from "react";
import { useFilters, usePagination, useSortBy, useTable } from "react-table";

export function TextColumnFilter({ column: { label, helperText, filterValue, setFilter }}) {
  return (
    <TextField
      label={label}
      helperText={helperText}
      value={filterValue || ""}
      size="small"
      onChange={
        e => {
          setFilter(e.target.value || undefined);  // Set undefined to remove the filter entirely
        }
      }
    />
  );
}

export function SelectColumnFilter({ column: { id, label, helperText, multiple = false, options = null, filterValue, setFilter, preFilteredRows, sortOptions = false } }) {
  // Calculate the organic options for filtering using the preFilteredRows.
  const columnOptions = Array.from(
    React.useMemo(
      () => {
        const optionsSet = options ? options : new Set(
          preFilteredRows.map(
            row => row.values[id]
          )
        );

        return [...optionsSet.values()];
      },
      [ id, options, preFilteredRows ]
    )
  );

  if (sortOptions) {
    columnOptions.sort();
  }

  return (
    <TextField
      select
      SelectProps={{
        multiple: multiple,
        renderValue: multiple ? (selected) => selected.join(", ") : undefined
      }}
      label={label}
      helperText={helperText}
      value={filterValue || (multiple ? [] : "")}
      size="small"
      fullWidth
      onChange={
        ({ target: { value: targetValue }}) => {
          if (multiple) {
            setFilter(
              targetValue.length === 0 || targetValue.includes("")
                ? undefined
                : targetValue
            );
          } else {
            setFilter(targetValue || undefined);
          }
        }
      }
    >
      <MenuItem value="">
        <ListItemText primary="Any" sx={{ textAlign: multiple ? "center" : undefined }} />
      </MenuItem>
      {
        columnOptions.map(
          (option, i) => (
            <MenuItem key={i} value={option}>
              { multiple ? <Checkbox checked={filterValue ? filterValue.indexOf(option) > -1 : false} /> : undefined }
              <ListItemText primary={option} />
            </MenuItem>
          )
        )
      }
    </TextField>
  );
}

export const ScrollableTable = styled(Table)`
  display: block;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
`;

export function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

// Remove the filter if the string is empty.
fuzzyTextFilterFn.autoRemove = val => !val;

export function BaseTable({ theme, columns, defaultPageSize, data }) {
  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      text: (rows, id, filterValue) => {
        return rows.filter(
          row => {
            const rowValue = row.values[id];
            return rowValue !== undefined
              ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
              : true;
          }
        );
      },
      in: (rows, id, filterValue) => {
        return rows.filter(
          row => {
            return filterValue.includes(row.values[id]);
          }
        );
      }
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data: data,
      filterTypes,
      initialState: {
        pageSize: defaultPageSize
      }
    },
    useFilters,
    useSortBy,
    usePagination
  );

  function updatePage(event, page) {
    gotoPage(page);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <TableContainer>
          <ScrollableTable {...getTableProps()} stickyHeader size="small">
            <TableHead>
              {headerGroups.map(
                headerGroup => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(
                      column => (
                        <TableCell
                          {...column.getHeaderProps()}
                          align="center"
                          width={column.width}
                          sx={{
                            fontWeight: "bold",
                            left: column.sticky ? 0 : undefined,
                            position: column.sticky ? "sticky" : undefined,
                            textAlign: column.textAlign ? column.textAlign : "center",
                            whiteSpace: "nowrap",
                            backgroundColor: column.backgroundColor
                              ? column.backgroundColor
                              : undefined,
                            zIndex: column.sticky ? theme.zIndex.appBar + 2 : undefined
                          }}
                        >
                          <div {...column.getSortByToggleProps()}>
                            <span>
                              {
                                column.showSortLabel
                                  ? column.isSorted
                                    ? (column.isSortedDesc ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />)
                                    : <SwapVertIcon fontSize="small" />
                                  : null
                              }
                            </span>
                            <div>{column.showHeader ? column.render("Header") : null}</div>
                            <div>{column.canFilter ? column.render("Filter") : null}</div>
                          </div>
                        </TableCell>
                      ))}
                  </TableRow>
                )
              )}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {page.map(
                (row, i) => {
                  prepareRow(row);
                  return (
                    <TableRow {...row.getRowProps()}>
                      {row.cells.map(
                        cell => {
                          return <TableCell
                            {...cell.getCellProps()}
                            sx={{
                              left: cell.column.sticky ? 0 : undefined,
                              position: cell.column.sticky ? "sticky" : undefined,
                              textAlign: cell.column.textAlign ? cell.column.textAlign : "center",
                              whiteSpace: "nowrap",
                              backgroundColor: cell.column.backgroundColor
                                ? cell.column.backgroundColor
                                : undefined
                            }}
                          >
                            {cell.render("Cell")}
                          </TableCell>;
                        }
                      )}
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </ScrollableTable>
          <Stack spacing={2}>
            <TablePagination
              component="div"
              count={rows.length}
              labelRowsPerPage="Rows"
              rowsPerPage={pageSize}
              page={pageIndex}
              showFirstButton
              showLastButton
              onPageChange={updatePage}
              onRowsPerPageChange={e => setPageSize(Number(e.target.value))}
            />
          </Stack>
        </TableContainer>
      </CssBaseline>
    </ThemeProvider>
  );
}
