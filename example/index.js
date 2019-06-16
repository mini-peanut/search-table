import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Filters from '../components/filters'

class App extends Component {
  render() {
    const filtersProps = {
      columns: [{
        dataIndex: 'ruleName',
        label: '规则名称'
      }]
    };
    return (
      <div>
        <Filters {...filtersProps} />
      </div>
    )
  }
}

// const Happ = hot(App)
ReactDOM.render(<App />, document.getElementById('app'))
