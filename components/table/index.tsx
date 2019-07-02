import * as React from 'react';
import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import { ConfigConsumer, ConfigConsumerProps} from "antd/lib/config-provider";
import { PaginationConfig } from 'antd/es/table';
import {
  TableProps,
  TableListItem,
  TableColumnProps,
  TableState,
  Filters,
  Sorter
} from './data';

import Table from 'antd/lib/table'
import Alert from 'antd/lib/alert'

import 'antd/lib/table/style'
import 'antd/lib/alert/style'
import 'antd/lib/icon/style'
import './style.less'
import * as PropTypes from "prop-types";

const TablePropTypes = {
    loading: PropTypes.bool,
    dataSource: PropTypes.array,
    columns: PropTypes.array,
    selectedRows: PropTypes.array,
    onTableChange: PropTypes.func,
    onCleanSelectedKeys: PropTypes.func,
    rowKey: PropTypes.string,
    pagination: PropTypes.object
};

const TableDefaultProps = {
    loading: false,
    dataSource: [],
    columns: [],
    selectedRows: [],
    onTableChange: noop,
    onCleanSelectedKeys: noop
};

export default class extends React.Component<TableProps, TableState> {
    static propTypes = TablePropTypes;

    static defaultProps = TableDefaultProps;

    private prefixCls?: string;

    static getDerivedStateFromProps(nextProps: TableProps) {
        // clean state
        if (nextProps.selectedRows && nextProps.selectedRows.length === 0) {
            const needTotalList = initTotalList(nextProps.columns);
            return {
                selectedRowKeys: [],
                needTotalList,
            };
        }
        return null;
    }

    constructor(props: TableProps) {
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
        if (this.props.onCleanSelectedKeys) {
            this.props.onCleanSelectedKeys()
        }
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
        const tableClassName = `${prefixCls}-table`;

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
          <div className={tableClassName}>
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
