import * as React from 'react';
import * as PropTypes from 'prop-types';
import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import { ConfigConsumer, ConfigConsumerProps} from "antd/lib/config-provider";
import { ColumnProps, SorterResult, PaginationConfig, TableCurrentDataSource } from 'antd/es/table';
import { TableListItem } from './data';

import Table from 'antd/lib/table'
import Alert from 'antd/lib/alert'

import 'antd/lib/table/style'
import 'antd/lib/alert/style'
import 'antd/lib/icon/style'
import './style.less'

export type Filters = Record<keyof any, string[]>
export type Sorter = SorterResult<any>

export interface StandardTableProps {
    columns: any;
    onSelectRow: (row: any) => void;
    dataSource: any;
    rowKey?: string;
    selectedRows: any[];
    onChange?: (
      pagination: PaginationConfig,
      filters: Filters,
      sorter: Sorter,
      extra?: TableCurrentDataSource<any>
    ) => void;
    loading?: boolean;
    pagination: PaginationConfig
    prefixCls?: string
}

export type TableColumnProps = ColumnProps<TableListItem> & {
    needTotal?: boolean;
    total?: number;
};

export interface TableState {
    selectedRowKeys: object[],
    needTotalList: object[]
}

export interface Column {
    needTotal: boolean,
    dataIndex: string;
    label: string;
}

export default class StandardTable extends React.Component<StandardTableProps, TableState> {
    static propTypes = {
        loading: PropTypes.bool,
        dataSource: PropTypes.array,
        columns: PropTypes.array,
        selectedRows: PropTypes.array,
        onTableChange: PropTypes.func,
        rowKey: PropTypes.string
    };

    static defaultProps = {
        loading: false,
        dataSource: [],
        columns: [],
        selectedRows: [],
        onTableChange: noop
    };

    private prefixCls?: string;

    static getDerivedStateFromProps(nextProps: StandardTableProps) {
        // clean state
        if (nextProps.selectedRows.length === 0) {
            const needTotalList = initTotalList(nextProps.columns);
            return {
                selectedRowKeys: [],
                needTotalList,
            };
        }
        return null;
    }

    constructor(props: StandardTableProps) {
        super(props);
        const { columns } = props;
        const needTotalList = initTotalList(columns);

        this.state = {
            selectedRowKeys: [],
            needTotalList,
        };
    }

    handleRowSelectChange = (selectedRowKeys: string[] | number[], selectedRows: TableListItem[]) => {
        let { needTotalList } = this.state;
        needTotalList = needTotalList.map(item => ({
            ...item,
            // @ts-ignore
            total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
        }));
        const { onSelectRow } = this.props;
        if (onSelectRow) {
            onSelectRow(selectedRows);
        }
        // @ts-ignore
        this.setState({ selectedRowKeys, needTotalList });
    };

    handleTableChange = (pagination: PaginationConfig, filters: Filters, sorter: Sorter) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(pagination, filters, sorter);
        }
    };

    cleanSelectedKeys = () => {
        this.handleRowSelectChange([], []);
    };

    render () {
        return (
          <LocaleProvider locale={zh_CN}>
              <ConfigConsumer>{this.renderTable}</ConfigConsumer>
          </LocaleProvider>
        )
    }

    renderTable = ({ getPrefixCls }: ConfigConsumerProps) => {
        const { prefixCls: customizePrefixCls, pagination, dataSource, rowKey, ...rest } = this.props;
        const prefixCls = getPrefixCls('filter', customizePrefixCls);

        // To support old version react.
        // Have to add prefixCls on the instance.
        // https://github.com/facebook/react/issues/12397
        this.prefixCls = prefixCls;
        const standardTableClassName = `${prefixCls}-standard-table`;

        const paginationProps = {
            showSizeChanger: true,
            showQuickJumper: true,
            ...pagination,
        };
        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            fixed: true,
            selectedRowKeys,
            onChange: this.handleRowSelectChange,
            getCheckboxProps: (record: TableListItem)=> ({
                disabled: record.disabled,
            }),
        };
        return (
          <div className={standardTableClassName}>
              {this.renderAlert()}
              <Table
                rowKey={rowKey || 'id'}
                // @ts-ignore
                rowSelection={rowSelection}
                dataSource={dataSource}
                pagination={paginationProps}
                onChange={this.handleTableChange}
                {...rest}
              />
          </div>
        );
    };

    renderAlert = () => {
        const tableAlertProps = `${this.prefixCls}-standard-table-alert`;
        const selectedRowKeys = this.state.selectedRowKeys;
        const AlertMsg = (
          <React.Fragment>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
              <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  清空
              </a>
          </React.Fragment>
        );

        return (
          <div className={tableAlertProps}>
            <Alert message={AlertMsg} type="info" showIcon/>
          </div>
        )
    }
}


function initTotalList(columns: TableColumnProps[]) {
    if (!columns) {
        return [];
    }
    const totalList: TableColumnProps[] = [];
    columns.forEach(column => {
        if (column.needTotal) {
            totalList.push({ ...column, total: 0 });
        }
    });
    return totalList;
}

function noop() {}
