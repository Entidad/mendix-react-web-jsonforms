import { useState } from "react";
import { vanillaRenderers, vanillaCells } from '@jsonforms/vanilla-renderers';
import { JsonForms } from '@jsonforms/react';
var get = require('lodash.get');


import CheckboxGroupControl, {checkboxControlTester} from './CheckboxGroupControl';
const renderers = [
    ...vanillaRenderers,    
    { tester: checkboxControlTester, renderer: CheckboxGroupControl }
];


export function Form(props:any){

    const [dato, setDato] = useState(props.initData);   

    if(props.language && props.language!="none"){
        const createTranslator = (locale:any) => (key:any, defaultMessage:any) => {            
            let myi18nfile=JSON.parse(props.i18nData);
            return get(myi18nfile, `${locale}.${key}`, defaultMessage);
        }
        let translation=createTranslator(props.language);
        return ( 
            <div className="jsonschema-to-jsonform-root">
                <JsonForms
                    schema={JSON.parse(props.schema)}
                    uischema={JSON.parse(props.uischema)}
                    data={JSON.parse(dato)}
                    renderers={renderers}
                    cells={vanillaCells}
                    i18n={{locale: props.language, translate: translation}}
                    onChange={({ data, errors }) => {
                        setDato(JSON.stringify(data));
                        props._onChange(data, errors);
                    }}
                />
            </div>
        );
    }else{
        return ( 
            <div className="jsonschema-to-jsonform-root">
                <JsonForms
                    schema={JSON.parse(props.schema)}
                    uischema={JSON.parse(props.uischema)}
                    data={JSON.parse(dato)}
                    renderers={renderers}
                    cells={vanillaCells}
                    onChange={({ data, errors }) => {
                        setDato(JSON.stringify(data));
                        props._onChange(data, errors);
                    }}
                />
            </div>
        )
    }
}
