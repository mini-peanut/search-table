import { ColumnProps, PaginationConfig, SorterResult, TableCurrentDataSource } from "antd/es/table";
import * as PropTypes from "prop-types";

export interface TableListItem {
  key: number;
  disabled?: boolean;
  href: string;
  avatar: string;
  name: string;
  title: string;
  owner: string;
  desc: string;
  callNo: number;
  status: number;
  updatedAt: Date;
  createdAt: Date;
  progress: number;
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface TableListDate {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
}

export interface TableListParams {
  sorter: string;
  status: string;
  name: string;
  pageSize: number;
  currentPage: number;
}

export type Filters = Record<keyof any, string[]>

export type Sorter = SorterResult<any>

export interface TableProps {
  columns: any;
  onSelectRow?: (row: any) => void;
  dataSource: object[];
  rowKey?: string;
  selectedRows?: any[];
  onChange?: (
    pagination: PaginationConfig,
    filters: Filters,
    sorter: Sorter,
    extra?: TableCurrentDataSource<any>
  ) => void;
  loading?: boolean;
  pagination?: PaginationConfig
  prefixCls?: string,
  onCleanSelectedKeys: () => void
}

export type TableColumnProps = ColumnProps<TableListItem> & {
  needTotal?: boolean;
  total?: number;
};

export interface TableState {
  selectedRowKeys: object[],
  needTotalList: object[]
}
