import { Component, ReactNode, createElement } from "react";
import { JsonformsWebContainerProps } from "../typings/JsonformsWebProps";
import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import { JsonForms } from '@jsonforms/react';

import "./ui/JsonformsWeb.css";

interface AppState {
    schema: string;
    uischema: string;
    initData: string;
    formData: string;
    i18nData: string;
    language: string;
    errorShow: boolean;
    errorMessage:string | undefined;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: any, value: object | null) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value; 
    };
};

const schemaX = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      done: {
        type: 'boolean',
      },
      due_date: {
        type: 'string',
        format: 'date',
      },
      recurrence: {
        type: 'string',
        enum: ['Never', 'Daily', 'Weekly', 'Monthly'],
      },
    },
    required: ['name', 'due_date'],
  };
  const uischemaX = {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        label: false,
        scope: '#/properties/done',
      },
      {
        type: 'Control',
        scope: '#/properties/name',
      },
      {
        type: 'HorizontalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/due_date',
          },
          {
            type: 'Control',
            scope: '#/properties/recurrence',
          },
        ],
      },
    ],
  };

export class JsonformsWeb extends Component<JsonformsWebContainerProps, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            schema: "{}",
            uischema: "{}",
            initData: "{}",
            formData: "{}",
            i18nData:"{}",
            language:"",
            errorShow: false,
            errorMessage:"Waiting for the form submition"
        };
    }

    

    render(): ReactNode {

        const onChange = (errors:any, data:any) => {
            if(errors){
                console.error("Using the specified JSON schema, a JSON form error occurred.");
            }else{
                const onSubmitJson = JSON.stringify(data, getCircularReplacer());
                const jsonString: string = JSON.stringify(JSON.parse(onSubmitJson).formData);
                if (this.props.mxFormData.value == jsonString) {
                    this.setState({ errorShow: true });
                    this.setState({ errorMessage: "Form values entered match those in the database." });
                }
                this.props.mxFormData.setValue(jsonString);
            }
        };

        return (
                <div className="jsonschema-to-jsonform-root">
                    <JsonForms
                        schema={schemaX}
                        uischema={uischemaX}
                        data={JSON.parse(this.state.initData)}
                        renderers={vanillaRenderers}
                        cells={vanillaCells}
                        onChange={({ errors, data }) => onChange(errors, data)}
                    />
                    <div className="JSONViewer">
                        {this.state.errorShow && (
                            <div className="alert alert-warning">
                                <strong>Warning!</strong> {this.state.errorMessage}
                            </div>
                        )}
                    </div>
                </div>
                );
    }

    componentDidMount(): void {
        const {  mxSchema, mxUiSchema, mxInitData } = this.props;

        let inputSchema = mxSchema.value ? mxSchema.value.toString() : '{"description": "JSON schema received was empty!","type": "object"}';
        let inputUISchema = mxUiSchema.value ? mxUiSchema.value.toString() : "{}";
        let inputInitData = mxInitData.value ? mxInitData.value.toString() : "{}";

        let eSchema=isValidJSON(inputSchema);
        let eUiSchema=isValidJSON(inputUISchema);
        let eInitData=isValidJSON(inputInitData);
        
        let eMessage;
        let eShow=false;
        if(eSchema){
            getErrorMessage("Schema:", eSchema, eMessage)
            eShow=true;
            inputSchema = '{}';
        }
        if(eUiSchema){
            getErrorMessage("UISchema:", eUiSchema, eMessage)
            eShow=true;
            inputUISchema = '{}';
        }
        if(eInitData){
            getErrorMessage("InitData:", eInitData, eMessage)
            eShow=true;
        }
        this.setState({
            schema: inputSchema,
            uischema: inputUISchema,
            initData: inputInitData,
            errorShow:eShow,
            errorMessage:eMessage

        });
    }

    componentDidUpdate(prevProps: Readonly<JsonformsWebContainerProps>): void {
        const { mxSchema, mxUiSchema, mxInitData } = this.props;
        if (
            mxSchema.value !== prevProps.mxSchema.value ||
            mxUiSchema.value !== prevProps.mxUiSchema.value ||
            mxInitData.value !== prevProps.mxInitData.value
        ) {
            let inputSchema = mxSchema.value?.toString() || '{"description": "JSON schema received was empty!","type": "object"}';
            let inputUISchema = mxUiSchema!.value?.toString() || "{}";
            let inputInitData = mxInitData!.value?.toString() || "{}";

            let eSchema=isValidJSON(inputSchema);
            let eUiSchema=isValidJSON(inputUISchema);
            let eInitData=isValidJSON(inputInitData);
            
            let eMessage;
            let eShow=false;
            if(eSchema){
                getErrorMessage("Schema:", eSchema, eMessage)
                eShow=true;
                inputSchema = '{}';
            }
            if(eUiSchema){
                getErrorMessage("UISchema:", eUiSchema, eMessage)
                eShow=true;
                inputUISchema = '{}';
            }
            if(eInitData){
                getErrorMessage("InitData:", eInitData, eMessage)
                eShow=true;
            }
            this.setState({
                schema: inputSchema,
                uischema: inputUISchema,
                initData: inputInitData,
                errorShow:eShow,
                errorMessage:eMessage

            });
        }
    }

}

function isValidJSON(jsonString: string) {
    try {
        JSON.parse(jsonString);
        return undefined;
    } catch (e) {
        return e.message;
    }
}

function getErrorMessage(_type:string, _error:string|undefined, _message:string|undefined){
    if (_error) {
        console.debug(_error);
        if(!_message) _message=""; 
        return _message+_type+_error+"\n";
    }        
    return _message;
}