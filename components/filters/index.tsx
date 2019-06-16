import * as React from 'react'
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';
import Button from 'antd/lib/button'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import DatePicker from 'antd/lib/date-picker'
import { FormComponentProps } from 'antd/lib/form/Form';
import { ConfigConsumer, ConfigConsumerProps} from "antd/lib/config-provider";

import 'antd/lib/button/style'
import 'antd/lib/col/style'
import 'antd/lib/form/style'
import 'antd/lib/input/style'
import 'antd/lib/row/style'
import 'antd/lib/select/style'
import 'antd/lib/date-picker/style'

export interface Action {
    onClick: (filters: object) => void;
    text: string
}
export interface FiltersProps {
    columns: [];
    defaultValues: {[key: string]: string},
    form: any;
    moreActions: object[];
    onSearch: (filters: object) => void;
    showReset: boolean,
    prefixCls: string
}
export interface FormItem {
    dataIndex: string;
    type: any;
    options: object[];
    label: string
}
export interface Option {
    text: string,
    value: any
}

function noop() {}

const ColumnsChunkSize = 3;
const DateFormat = 'YY/MM/DD';
const Gutter = { md: 8, lg: 24, xl: 48 };
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select;

class Filter extends React.Component<FiltersProps & FormComponentProps, any> {
    static propTypes = {
        columns: PropTypes.array,
        form: PropTypes.object,
        onSearch: PropTypes.func,
        defaultValues: PropTypes.object,
        moreActions: PropTypes.array,
        showReset: PropTypes.bool
    };

    static defaultProps = {
        columns: [],
        form: {},
        onSearch: noop,
        defaultValues: {},
        moreActions: [],
        showReset: false
    };

    private prefixCls?: string;

    constructor(props: FiltersProps) {
        super(props);
    }

    handleFormReset = () => {
        const { form, onSearch } = this.props;
        form.resetFields();
        onSearch({});
    };

    onSubmit = (e: any) => {
        e.preventDefault();
        const { form, onSearch } = this.props;

        form.validateFields((err: Error, fieldsValue: object) => {
            if (err) return;

            onSearch(fieldsValue);
        });
    };

    render() {
        return <ConfigConsumer>{this.renderFilters}</ConfigConsumer>;
    }

    renderFilters = ({ getPrefixCls }: ConfigConsumerProps) => {
        const { prefixCls: customizePrefixCls } = this.props;
        const { renderActions, onSubmit } = this;
        const columns = this.props.columns.map((item: {}, key: number) => ({...item, key}));
        const filterRows = _.chunk(columns, ColumnsChunkSize);
        const isLastRowHasFreeSpace = filterRows.length && filterRows[filterRows.length - 1].length < 3;
        const prefixCls = getPrefixCls('calendar', customizePrefixCls);

        // To support old version react.
        // Have to add prefixCls on the instance.
        // https://github.com/facebook/react/issues/12397
        this.prefixCls = prefixCls;
        const filtersClassName = `${prefixCls}-filters`;

        return (
          <div className={filtersClassName}>
              <Form onSubmit={onSubmit} layout="inline">
                  {filterRows.map(_.partialRight(this.renderFilterRows, filterRows))}
                  <Row gutter={Gutter}>{!isLastRowHasFreeSpace && renderActions()}</Row>
              </Form>
          </div>
        );
    };

    renderFilterRows = (row: [], index: number, filterRows: object[][]) => {
        const isLastRowHasFreeSpace = filterRows[filterRows.length - 1].length < 3;
        const isLastChunk = index === filterRows.length - 1;
        const renderFiltersRow = (item: FormItem, key: number) => (
          <Col md={8} sm={24} key={key}>
              <FormItem label={item.label}>{this.renderFormControl(item)}</FormItem>
          </Col>
        );

        return [
          <Row gutter={Gutter} key={index}>
              {row.map(renderFiltersRow)}
              {isLastRowHasFreeSpace && isLastChunk && this.renderActions()}
          </Row>,
          <Row gutter={Gutter} key={'action' + index}>
              {!isLastRowHasFreeSpace && this.renderActions()}
          </Row>
        ]
    };

    renderFormControl = (item: FormItem) => {
        const { form: { getFieldDecorator }, defaultValues } = this.props;
        const options = { initialValue: defaultValues[item.dataIndex] || '' };
        const baseProps = { style: { width: '100%', maxWidth: '200px' } };

        const renderOption = ({value, text}: Option) =>  (
          <Option value={value} key={value}>{text}</Option>
        );

        switch (item.type) {
            case 'select':
                return getFieldDecorator(item.dataIndex, options)(
                  <Select placeholder="请选择" {...baseProps}>
                    {item.options.map(renderOption)}
                  </Select>
                );
            case 'date':
                return getFieldDecorator(item.dataIndex, options)(
                  <DatePicker {...baseProps} format={DateFormat} />
                );
            case 'range':
                return getFieldDecorator(item.dataIndex, options)(
                  <RangePicker {...baseProps} format={DateFormat} />
                );
            default:
                return getFieldDecorator(item.dataIndex, options)(
                  <Input placeholder="请输入" {...baseProps} />
                );
        }
    };

    renderActions = () => {
        const moreActions = this.props.moreActions;
        const actionsClassName = `${this.prefixCls}-filters-actions`;
        const renderAction = (action: Action, key: number) => {
            const searchQuery = this.props.form.getFieldsValue();
            const handleClick = _.partial(action.onClick, searchQuery);
            return <Button style={{ marginLeft: 8 }} onClick={handleClick} key={key}>{action.text}</Button>
        };

        return (
          <Col md={8} sm={24}>
            <span className={actionsClassName}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              {moreActions.map(renderAction)}
            </span>
          </Col>
        );
    };
}

// @ts-ignore
export default Form.create<FiltersProps>({})(Filter)
