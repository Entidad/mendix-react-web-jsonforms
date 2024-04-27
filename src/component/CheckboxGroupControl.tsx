import { createElement } from "react";
import {
  and,
  ControlProps,
  RankedTester,
  rankWith,
  resolveSchema,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
  JsonSchema
} from '@jsonforms/core';
import { withJsonFormsMultiEnumProps } from '@jsonforms/react';

import { VanillaRendererProps, withVanillaControlProps } from '@jsonforms/vanilla-renderers';
import { CheckboxGroupControl } from './CheckboxGroup';
import { isEmpty } from "lodash";
export const checkboxGroupControl = (
  props: ControlProps & VanillaRendererProps
) => {
  return <CheckboxGroupControl {...props} />;
};


const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean =>
  schema.type === 'string' && schema.enum !== undefined;

export const checkboxControlTester: RankedTester = rankWith(
  5,
  and(
    uiTypeIs('Control'),
    and(
      schemaMatches(
        (schema) =>
          !isEmpty(schema) &&
          schema.type==='array' &&
          !Array.isArray(schema.items) &&
          schema.uniqueItems === true
      ),
      schemaSubPathMatches('items', (schema, rootSchema) => {
        const resolvedSchema = schema.$ref
          ? resolveSchema(rootSchema, schema.$ref, rootSchema)
          : schema;
        return hasOneOfItems(resolvedSchema) || hasEnumItems(resolvedSchema);
      })
    )
  )
);



export default withVanillaControlProps(withJsonFormsMultiEnumProps(checkboxGroupControl));


/*
uiTypeIs('Control'),
  schemaMatches(schema =>
    !_.isEmpty(schema)
    && schema.type === 'array'
    && !_.isEmpty(schema.items)
    && !Array.isArray(schema.items)

    export const checkboxControlTester: RankedTester = rankWith(
  2,
  and(
    uiTypeIs('Control'),    
    schemaMatches(schema =>
      !_.isEmpty(schema)
      && schema.type === 'array'
      && !_.isEmpty(schema.items)
      && !Array.isArray(schema.items)
    )
  )
);

    */