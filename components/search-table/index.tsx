import * as React from 'react'
import Table from "../table";
import Filter from "../filter";

import { Card } from "antd";
import "antd/lib/card/style";

type SearchTableProps = any

export default class SearchTable extends React.Component <SearchTableProps, any>{
  render() {
    return (
      <Card  className="main">
        <Filter {...this.props} />
        <Table {...this.props} />
      </Card>
    );
  }
}
