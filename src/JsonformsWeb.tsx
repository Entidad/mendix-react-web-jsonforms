import { Component, ReactNode, createElement, useMemo } from "react";
import { JsonformsWebContainerProps } from "../typings/JsonformsWebProps";
import { vanillaRenderers, vanillaCells } from '@jsonforms/vanilla-renderers';
import { JsonForms } from '@jsonforms/react';
var get = require('lodash.get');

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
        
        const onChange = (data:any, errors:any) => {
            if(errors && errors!=null && errors.length>0 && errors[0]){
                console.debug(errors);
                console.error("Using the specified JSON schema, a JSON form error occurred.");
            }else{
                console.debug(data);
                /*
                
                if (this.props.mxFormData.value == jsonString) {
                    this.setState({ errorShow: true });
           z         this.setState({ errorMessage: "Form values entered match those in the database." });
                }
                
                const jsonString: string = JSON.stringify(JSON.parse(onSubmitJson).formData);
                */
                //const onSubmitJson = JSON.stringify(data, getCircularReplacer());
                //this.state.formData=JSON.stringify(data);
                //this.props.mxFormData.setValue(onSubmitJson);
            }
        };

        let locale=this.state.language;
        console.debug("Language:"+locale);        
        if(locale && locale!="none"){
            console.debug("Step1");
            const createTranslator = (locale:any) => (key:any, defaultMessage:any) => {            
                console.debug("StepLost");
                console.debug(`Key: ${key}, Default Message: ${defaultMessage}`);
                let myi18nfile=JSON.parse(this.state.i18nData);
                console.debug(this.state.i18nData);
                console.debug(myi18nfile);
                
                return get(myi18nfile, `${locale}.${key}`, defaultMessage);
            }
            console.debug("Step2");
            let translation=createTranslator(locale);
            
            /*
            try{
                translation = useMemo(() => createTranslator(locale), [locale]);
            }catch(e){
                console.debug(e)
                console.debug(e.message);
                console.debug("Erroir:"+e.message)
            }
            */
            console.debug("Step3");
            return (
                <div className="jsonschema-to-jsonform-root">
                    <JsonForms
                        schema={JSON.parse(this.state.schema)}
                        uischema={JSON.parse(this.state.uischema)}
                        data={JSON.parse(this.state.initData)}
                        renderers={vanillaRenderers}
                        cells={vanillaCells}
                        i18n={{locale: locale, translate: translation}}
                        onChange={({ data, errors }) => onChange(data, errors)}
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

        } else{
            return (
                <div className="jsonschema-to-jsonform-root">
                    <JsonForms
                        schema={JSON.parse(this.state.schema)}
                        uischema={JSON.parse(this.state.uischema)}
                        data={JSON.parse(this.state.initData)}
                        renderers={vanillaRenderers}
                        cells={vanillaCells}
                        onChange={({ data, errors }) => onChange(data, errors)}
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
    }

    componentDidMount(): void {
        const {  mxSchema, mxUiSchema, mxInitData, mxI18n, mxLanguage } = this.props;

        let inputSchema = mxSchema.value ? mxSchema.value.toString() : '{"description": "JSON schema received was empty!","type": "object"}';
        let inputUISchema = mxUiSchema.value ? mxUiSchema.value.toString() : "{}";
        let inputInitData = mxInitData.value ? mxInitData.value.toString() : "{}";
        let inputI18n = mxI18n.value ? mxI18n.value.toString() : "{}";
        let inputLanguage = mxLanguage.value ? mxLanguage.value.toString() : 'none';

        let eSchema=isValidJSON(inputSchema);
        let eUiSchema=isValidJSON(inputUISchema);
        let eInitData=isValidJSON(inputInitData);
        let e18n=isValidJSON(inputI18n);
        
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
        if(e18n){
            inputI18n = '{}';
        }
        this.setState({
            schema: inputSchema,
            uischema: inputUISchema,
            initData: inputInitData,
            i18nData:inputI18n,
            language: inputLanguage,
            errorShow:eShow,
            errorMessage:eMessage

        });
    }

    componentDidUpdate(prevProps: Readonly<JsonformsWebContainerProps>): void {
        const { mxSchema, mxUiSchema, mxInitData, mxI18n, mxLanguage } = this.props;
        if (
            mxSchema.value !== prevProps.mxSchema.value ||
            mxUiSchema.value !== prevProps.mxUiSchema.value ||
            mxInitData.value !== prevProps.mxInitData.value ||
            mxI18n.value!==prevProps.mxI18n.value
        ) {
            let inputSchema = mxSchema.value?.toString() || '{"description": "JSON schema received was empty!","type": "object"}';
            let inputUISchema = mxUiSchema!.value?.toString() || "{}";
            let inputInitData = mxInitData!.value?.toString() || "{}";
            let inputI18n = mxI18n!.value?.toString() || "{}";
            let inputLanguage = mxLanguage!.value?.toString() || 'none';

            let eSchema=isValidJSON(inputSchema);
            let eUiSchema=isValidJSON(inputUISchema);
            let eInitData=isValidJSON(inputInitData);
            let e18n=isValidJSON(inputI18n);
            
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
            if(e18n){
                inputI18n = '{}';
            }
            this.setState({
                schema: inputSchema,
                uischema: inputUISchema,
                initData: inputInitData,
                i18nData:inputI18n,
                language: inputLanguage,
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
        console.debug("Not Valid JSON:"+e.message)
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