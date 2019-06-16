import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Filters from '../components/filters'
import Table from '../components/Table'
import './style.less'

const columns = [
  {
    title: '规则名称',
    dataIndex: 'name',
  },
  {
    title: '描述',
    dataIndex: 'desc',
  },
  {
    title: '服务调用次数',
    dataIndex: 'callNo',
    sorter: true,
    align: 'right',
    render: (val) => `${val} 万`,
    // mark to display a total number
    needTotal: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    render(val) {
      return <Badge status={statusMap[val]} text={status[val]} />;
    },
  },
  {
    title: '上次调度时间',
    dataIndex: 'updatedAt',
    sorter: true,
    render: (val) => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
  },
  {
    title: '操作',
    render: (text, record) => (
      <Fragment>
        <a>配置</a>
        <Divider type="vertical" />
        <a href="">订阅警报</a>
      </Fragment>
    ),
  },
];



class App extends Component {
  render() {
    const filtersProps = {
      columns: [{
        dataIndex: 'ruleName',
        label: '规则名称'
      }],
      moreActions: [{
        text: '新建',
        onClick () {}
      }]
    };

    const tableProps = {
      columns,
      dataSource: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      }
    };
    return (
      <div className="app">
        <Filters {...filtersProps} />
        <Table {...tableProps} />
      </div>
    )
  }
}

// const Happ = hot(App)
ReactDOM.render(<App />, document.getElementById('app'))
