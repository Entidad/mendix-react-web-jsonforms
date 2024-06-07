import { Component, ReactNode, createElement } from "react";
import { JsonformsWebContainerProps } from "../typings/JsonformsWebProps";
import { Form } from "../src/component/Form";
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
        if(this.state.errorShow){
            return (
                <div className="jsonschema-to-jsonform-root">
                    <div className="JSONViewer">
                        {this.state.errorShow && (
                            <div className="alert alert-warning">
                                <strong>Warning!</strong> {this.state.errorMessage}
                            </div>
                        )}
                    </div>
                </div>
            );
        }else{
            if(this.state.schema!=="{}" || this.state.uischema!=="{}"){
                return (                
                    <Form
                        schema={this.state.schema}
                        uischema={this.state.uischema}
                        initData={this.state.initData}
                        i18nData={this.state.i18nData}
                        language={this.state.language}
                        _onChange={(data:any, errors:any) => {
                            if(errors && errors!=null && errors.length>0 && errors[0]){
                                console.debug("Using the specified JSON schema, a JSON form error occurred.");
                                console.debug(errors);
                            }else{
                                const onSubmitJson = JSON.stringify(data, getCircularReplacer());
                                this.props.mxFormData.setValue(onSubmitJson);    
                            }
                        }}
                    /> 
                );    
            }
            
        }
    }

    componentDidMount(): void {
        const {  mxSchema, mxUiSchema, mxInitData, mxI18n, mxLanguage } = this.props;

        let inputSchema = mxSchema.value ? mxSchema.value.toString() : '{}';
        let inputUISchema = mxUiSchema.value ? mxUiSchema.value.toString() : "{}";
        let inputInitData = mxInitData.value ? mxInitData.value.toString() : "{}";
        let inputI18n = mxI18n.value ? mxI18n.value.toString() : "{}";
        let inputLanguage = mxLanguage.value ? mxLanguage.value.toString() : 'none';

        let eSchema=isValidJSON(inputSchema);
        let eUiSchema=isValidJSON(inputUISchema);
        let eInitData=isValidJSON(inputInitData);
        let e18n=isValidJSON(inputI18n);
        
        let eMessage="";
        let eShow=false;
        if(eSchema){
            eMessage=getErrorMessage("Schema", eSchema, eMessage);
            eShow=true;
            inputSchema = '{}';
        }
        if(eUiSchema){
            eMessage=getErrorMessage("UISchema", eUiSchema, eMessage);
            eShow=true;
            inputUISchema = '{}';
        }
        if(eInitData){
            eMessage=getErrorMessage("InitData", eInitData, eMessage);
            eShow=true;
            inputInitData = '{}';
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
            let inputSchema = mxSchema.value?.toString() || '{}';
            let inputUISchema = mxUiSchema!.value?.toString() || "{}";
            let inputInitData = mxInitData!.value?.toString() || "{}";
            let inputI18n = mxI18n!.value?.toString() || "{}";
            let inputLanguage = mxLanguage!.value?.toString() || 'none';

            let eMessage="";
            let eShow=false;

            let eSchema=isValidJSON(inputSchema);
            let eUiSchema=isValidJSON(inputUISchema);
            let eInitData=isValidJSON(inputInitData);
            let e18n=isValidJSON(inputI18n);

            if(eSchema){
                eMessage=getErrorMessage("Schema", eSchema, eMessage);
                eShow=true;
                inputSchema = '{}';
            }
            if(eUiSchema){
                eMessage=getErrorMessage("UISchema", eUiSchema, eMessage);
                eShow=true;
                inputUISchema = '{}';
            }
            if(eInitData){
                eMessage=getErrorMessage("InitData", eInitData, eMessage);
                eShow=true;
                inputInitData = '{}';
            }
            if(e18n){
                console.debug(e18n);
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

function getErrorMessage(_type:string, _error:string, _message:string){
    console.debug(_error);
    return _message+_type+":"+_error+"\n";
}