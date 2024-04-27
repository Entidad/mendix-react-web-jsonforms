import { createElement } from "react";
import {
  computeLabel,
  ControlProps,
  ControlState,
  isDescriptionHidden
} from '@jsonforms/core';
import { Control, withJsonFormsControlProps } from '@jsonforms/react';
import { withVanillaControlProps, VanillaRendererProps } from '@jsonforms/vanilla-renderers';
import merge from 'lodash/merge';

export class CheckboxGroupControl extends Control<
  ControlProps & VanillaRendererProps,
  ControlState
> {
  render() {
    const {
      classNames,
      id,
      label,
      required,
      description,
      errors,
      data,
      schema,
      uischema,
      visible,
      config,
      path,
      handleChange
    } = this.props;
    const isValid = errors.length === 0;
    const divClassNames = `validation  ${
      isValid ? classNames.description : 'validation_error'
    }`;
    const groupStyle: { [x: string]: any } = {
      display: 'flex',
      flexDirection: 'column'
    };

    const rowStyle: { [x: string]: any } = {
      display: 'flex',
      flexDirection: 'row'
    };

    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const showDescription = !isDescriptionHidden(
      visible,
      description,
      this.state.isFocused,
      appliedUiSchemaOptions.showUnfocusedDescription
    );
    const _items:any = schema.items;
    const options=_items.enum;

    const _handleRender = (_value:string) => {         
      if(data){    
        let tmp=[...data];   
        let exist=tmp.filter(item => item === _value);        
        if(exist.length>0){
          return true;
        }
      }
      return false;
    }

    const _handleChange = (_value:string) => {       
      let arr=[];
      if(data){
        let tmp=[...data];
        let exist=tmp.filter(item => item === _value);        
        if(exist.length==0){
          arr=[...tmp, _value];
        }else{
          arr=tmp.filter(item => item !== _value);            
        }        
      }else{
        arr.push(_value);
      }
      handleChange(path, arr); 
    };


    return (
      <div
        className='checkboxgroupctrl'
        hidden={!visible}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        <label htmlFor={id} className={classNames.label}>
          {computeLabel(
            label,
            required,
            appliedUiSchemaOptions.hideRequiredAsterisk
          )}
        </label>

        <div style={groupStyle}>
          {options && options.map((optionValue:string) => (
            <div key={optionValue} style={rowStyle}>
              <input
                type='checkbox'
                value={optionValue}
                id={optionValue}
                name={id}
                checked={_handleRender(optionValue)}
                onChange={(_) => _handleChange(optionValue)}
              />
              <label htmlFor={optionValue}>{optionValue}</label>
            </div>
          ))}
        </div>
        <div className={divClassNames}>
          {!isValid ? errors : showDescription ? description : null}
        </div>
      </div>
    );
  }
}

export default withVanillaControlProps(
  withJsonFormsControlProps(CheckboxGroupControl)
);
