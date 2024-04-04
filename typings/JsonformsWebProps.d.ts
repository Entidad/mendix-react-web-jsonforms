/**
 * This file was generated from JsonformsWeb.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export interface JsonformsWebContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    mxSchema: EditableValue<string>;
    mxUiSchema: EditableValue<string>;
    mxInitData: EditableValue<string>;
    mxI18n: EditableValue<string>;
    mxLanguage: EditableValue<string>;
    mxFormData: EditableValue<string>;
}

export interface JsonformsWebPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    mxSchema: string;
    mxUiSchema: string;
    mxInitData: string;
    mxI18n: string;
    mxLanguage: string;
    mxFormData: string;
    onChangeAction: {} | null;
}
