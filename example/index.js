import React from 'react'
import ReactDOM from 'react-dom'
import SearchTable from '../components/search-table'
import BasicLayout from '@ant-design/pro-layout'

import "antd/lib/card/style"
import './style.less'

function noop() {}
const columns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    filterType: 'input'
  },
  {
    title: '描述',
    dataIndex: 'desc',
    filterType: 'input'
  },
  {
    title: '服务调用次数',
    dataIndex: 'callNo',
    sorter: true,
    align: 'right',
    render: (val) => `${val} 万`,
    // mark to display a total number
    needTotal: true,
    filterType: 'input'
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



class App extends React.Component {
  constructor () {
    super();
    this.state = {
      collapsed: false
    };
  }
  render() {
    const tableProps = {
      columns,
      dataSource: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      scroll: {x: 1300},
      moreActions: [{
        text: '新建',
        onClick () {}
      }]
    };
    return (
      <BasicLayout
        collapsed={this.state.collapsed}
        onCollapse={val => {
          this.setState({collapsed: val})
        }}
        logo={noop}
      >
        <SearchTable {...tableProps} />
      </BasicLayout>
    )
  }
}

// const Happ = hot(App)
ReactDOM.render(<App />, document.getElementById('app'))
