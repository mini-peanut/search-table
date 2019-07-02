import * as React from 'react'
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';
import Button from 'antd/lib/button'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import {LocaleProvider} from "antd";
import DatePicker from 'antd/lib/date-picker'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import { FormComponentProps } from 'antd/lib/form/Form';
import { ConfigConsumer, ConfigConsumerProps} from "antd/lib/config-provider";

import 'antd/lib/button/style'
import 'antd/lib/col/style'
import 'antd/lib/form/style'
import 'antd/lib/input/style'
import 'antd/lib/row/style'
import 'antd/lib/select/style'
import 'antd/lib/date-picker/style'

import './style/index.less'

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
    prefixCls: string,
    onFieldsChange: (props: [], changeFields: object, allFields: []) => void
}
export interface FormItem {
    controlProps: object;
    dataIndex: string;
    filterType: string;
    options: object[];
    title: string
}
export interface Option {
    text: string,
    value: any
}
export const FilterPropTypes = {
    columns: PropTypes.array,
    form: PropTypes.object,
    onSearch: PropTypes.func,
    defaultValues: PropTypes.object,
    moreActions: PropTypes.array,
    showReset: PropTypes.bool,
    onFieldsChange: PropTypes.func
};
export const FilterDefaultProps = {
    columns: [],
    defaultValues: {},
    form: {},
    moreActions: [],
    onSearch: noop,
    showReset: false,
    prefixCls: '',
    onFieldsChange: noop
};

export const enum FiltersType {
    select = 'select',
    input = 'input',
    range = 'range',
    date = 'date'
}

function noop() {}

const ColumnsChunkSize = 3;
const DateFormat = 'YY/MM/DD';
const Gutter = { md: 8, lg: 24, xl: 48 };
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select;

class Filter extends React.Component<FiltersProps & FormComponentProps, any> {
    static propTypes = FilterPropTypes;

    static defaultProps = FilterDefaultProps;

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
        return (
          <LocaleProvider locale={zh_CN}>
              <ConfigConsumer>{this.renderFilters}</ConfigConsumer>
          </LocaleProvider>
        )
    }

    renderFilters = ({ getPrefixCls }: ConfigConsumerProps) => {
        const columns = _
          .chain(this.props.columns)
          .filter((item: FormItem) => !!item.filterType)
          .map((item: FormItem, key: number) => ({...item, key}))
          .value();

        const { prefixCls: customizePrefixCls } = this.props;
        const rows = _.chunk(columns, ColumnsChunkSize);
        const prefixCls = getPrefixCls('filter', customizePrefixCls);

        // To support old version react.
        // Have to add prefixCls on the instance.
        // https://github.com/facebook/react/issues/12397
        this.prefixCls = prefixCls;
        const filterClassName = `${prefixCls}-form`;

        return (
          <div className={filterClassName}>
              <Form onSubmit={this.onSubmit} layout="inline">
                  {rows.map(_.partialRight(this.renderFilterRows, rows))}
              </Form>
          </div>
        );
    };

    renderFilterRows = (row: object[], index: number, filterRows: object[][]) => {
        const isLastRowHasFreeSpace = filterRows[filterRows.length - 1].length < 3;
        const isLastChunk = index === filterRows.length - 1;
        const renderFiltersRow = (item: FormItem, key: number) => {
            const colProps = {md: 6, sm: 24, style: {paddingLeft: 0, paddingRight: 0}};
            if (item.filterType === FiltersType.range) {
                colProps.md = 12
            }
            return (
              <Col {...colProps} key={key}>
                  <FormItem label={item.title}>{this.renderFormControl(item)}</FormItem>
              </Col>
            )
        };

        const rowProps = {
            style: {
                marginLeft: '0',
                marginRight: '0'
            }
        };
        return [
          <Row gutter={Gutter} key={index} {...rowProps}>
              {row.map(renderFiltersRow)}
              {isLastRowHasFreeSpace && isLastChunk && this.renderActions()}
          </Row>,
          <Row gutter={Gutter} key={'action' + index} {...rowProps}>
              {!isLastRowHasFreeSpace && isLastChunk && this.renderActions()}
          </Row>
        ]
    };

    renderFormControl = (item: FormItem) => {
        const { form: { getFieldDecorator }, defaultValues } = this.props;
        const options = { initialValue: defaultValues[item.dataIndex] || '' };
        const controlProps = item.controlProps ? item.controlProps: {};
        const baseProps = { style: { width: '100%'}, ...controlProps};

        const renderOption = ({value, text}: Option) =>  (
          <Option value={value} key={value}>{text}</Option>
        );

        switch (item.filterType) {
            case FiltersType.select:
                return getFieldDecorator(item.dataIndex, options)(
                  <Select placeholder="请选择" {...baseProps}>
                    {item.options.map(renderOption)}
                  </Select>
                );
            case FiltersType.date:
                return getFieldDecorator(item.dataIndex, options)(
                  <DatePicker format={DateFormat} {...baseProps} />
                );
            case FiltersType.range:
                return getFieldDecorator(item.dataIndex, options)(
                  <RangePicker format={DateFormat} {...baseProps} />
                );
            default:
                return getFieldDecorator(item.dataIndex, options)(
                  <Input placeholder="请输入" {...baseProps} />
                );
        }
    };

    renderActions = () => {
        const moreActions = this.props.moreActions;
        const actionsClassName = `${this.prefixCls}-form-actions`;
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
export default Form.create<FiltersProps>({
    onFieldsChange(props, changedFields) {
        // @ts-ignore
        props.onFieldsChange && props.onFieldsChange(changedFields);
    }
    // @ts-ignore
})(Filter)
