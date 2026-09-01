## JsonformsWeb

Web widget that renders a form from a JSON Schema, using
[JSONForms](https://jsonforms.io/). Give it a schema, a UI schema and a data object as
string attributes; it renders the form and writes the entered data back.

Built for rendering survey definitions received over DIDComm, where the schema, layout and
translations all arrive as JSON strings rather than being modelled in Mendix.

## Features

- Form rendered entirely from a JSON Schema — no Mendix page work per form
- Layout controlled separately by a JSONForms UI schema
- Multi-language labels and enum values from a single translations object
- Writes entered data back as JSON on every change
- Change action for reacting to input

## Requirements

Studio Pro **11.12** or higher.

Version `2.0.0` is built against Mendix Pluggable Widgets Tools 11.12 (React 19). The widget
id is unchanged, so it is a drop-in replacement for `1.x` — no page changes are needed.

## Usage

Build from source:

```
git clone https://github.com/Entidad/mendix-react-web-jsonforms.git
cd ./mendix-react-web-jsonforms
npm install
npm run build
```

Deploy `entidad.io.JsonformsWeb.mpk` to `$PROJ/widgets`, then run
`Synchronize App Directory` in Studio Pro (`F4`, or `Menu / App / Synchronize App Directory`).

The widget needs an entity context, so place it inside a **Data view** or a **List view** row.
All six attributes are String and required — hold them on the entity that carries the form.

### Properties

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `mxSchema` | String attribute | yes | JSON Schema describing the fields. |
| `mxUiSchema` | String attribute | yes | JSONForms UI schema controlling layout and per-control options. |
| `mxInitData` | String attribute | yes | Initial values rendered into the form. |
| `mxI18n` | String attribute | yes | Translations, keyed by language. |
| `mxLanguage` | String attribute | yes | Which key of `mxI18n` to use. See below. |
| `mxFormData` | String attribute | yes | Receives the entered data as JSON. |
| `onChangeAction` | Action | no | Runs when the form data changes. |

## Data formats

All five input attributes hold **JSON as a string**, not Mendix objects. The examples below
are trimmed from a real DIDComm survey request.

### `mxSchema`

Standard JSON Schema. Property keys are arbitrary — in survey payloads they carry the
question type and a UUID:

```json
{
  "title": "Survey widget upgrade test",
  "type": "object",
  "properties": {
    "qstDate_1718370d": {
      "title": "What year did you graduate high school?",
      "type": "string",
      "format": "date"
    },
    "qstRadiobutton_28ff71cd": {
      "title": "What is your T-shirt size?",
      "type": "string",
      "enum": ["S - Small", "M - Medium", "L - Large"]
    },
    "qstMultiSelect_0a6844de": {
      "title": "Did you work in farm operations?",
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "enum": ["Goats, Milk", "Turkeys", "Hogs"] }
    }
  }
}
```

Dates are `"type": "string"` with `"format": "date"`. `"type": "date"` is **not** valid JSON
Schema and matches no renderer — JSONForms' `isDateControl` tester returns false for it, so
the field falls through to a generic control.

### `mxUiSchema`

A JSONForms UI schema. Each control points at a schema property by `scope`, and `options`
selects the renderer:

```json
{
  "type": "VerticalLayout",
  "elements": [
    { "type": "Control", "scope": "#/properties/qstDate_1718370d" },
    {
      "type": "Control",
      "scope": "#/properties/qstRadiobutton_28ff71cd",
      "options": { "format": "radio", "multi": false, "readonly": false }
    },
    {
      "type": "Control",
      "scope": "#/properties/qstTextArea_37dbed63",
      "options": { "multi": true }
    }
  ]
}
```

### `mxI18n` and `mxLanguage`

**Keyed by language name, not language code.** Despite the property description saying
"code", `mxLanguage` is used verbatim as the top-level key into `mxI18n` — so the values are
whatever your payload uses. In survey requests those are `English` and `Spanish`:

```json
{
  "English": {
    "title": "Survey widget upgrade test",
    "qstRadiobutton_28ff71cd": { "label": "What is your T-shirt size?" }
  },
  "Spanish": {
    "title": "Prueba de actualización del widget de encuestas",
    "qstRadiobutton_28ff71cd": {
      "label": "¿Cuál es tu talla de camiseta?",
      "S - Small": "S - Pequeño",
      "M - Medium": "M - Mediano",
      "L - Large": "L - Grande"
    }
  }
}
```

Two things to note about the shape:

- A question's caption goes under `label`. **Enum options are translated as sibling keys**,
  each mapping the untranslated option string to its translation. The untranslated string
  stays the stored value, so translating options does not change what lands in `mxFormData`.
- Lookup is `<mxLanguage>.<key>` via `lodash.get`, so a missing translation silently falls
  back to the default from the schema rather than erroring.

## Behaviour

**Translation is off unless `mxLanguage` is set.** An empty value becomes the sentinel
`"none"`, and the widget renders untranslated — using `title` from the schema. A language
that has no matching key in `mxI18n` behaves the same way, per-key.

**`mxFormData` is written on every change, but only while the form validates.** If JSONForms
reports validation errors the write is skipped entirely — the errors go to `console.debug` and
the attribute keeps its last valid value. So `mxFormData` is never partially or invalidly
populated, but it can also silently lag behind what is on screen while a field is invalid.

**`onChangeAction` is fired by Mendix, not by the widget.** It is bound declaratively on the
`mxFormData` property (`onChange="onChangeAction"` in the widget XML), so it runs whenever
`mxFormData` is actually written — which, per the above, means it does not fire while the
form is invalid.

**Malformed JSON is reported, not swallowed.** Each of `mxSchema`, `mxUiSchema`, `mxInitData`
and `mxI18n` is parsed separately; any that fails is replaced with `{}` and the widget renders
a `Warning!` alert naming which input was bad and why. If both the schema and UI schema end up
empty, nothing is rendered at all.

## Issues, suggestions and feature requests

[GitHub](https://github.com/Entidad/mendix-react-web-jsonforms/issues)

## Development and contribution

Requires Node **22.x** — Mendix Pluggable Widgets Tools 11.12 enforces `>=22.18.0 <23`, and
will refuse to build on Node 24 even though Studio Pro itself ships it.

1. `npm install`
2. `npm run build` to build once, or `npm start` to watch for changes.

`config.projectPath` in `package.json` points at `./tests/testProject`, which is **not** in
this repository — point it at a local app, or copy the `.mpk` by hand.

### Do not change `widgetName` or `packagePath`

They must stay `JsonformsWeb` and `entidad.io`. Together they decide where the bundle is
written (`entidad/io/jsonformsweb/JsonformsWeb.js`), and Mendix resolves that path from the
widget id in `src/JsonformsWeb.xml`. Commit `561729c` changed them to `JsonForms` /
`io.entidad.widget.web`; the build still succeeded, but it emitted the JS to a path Mendix
never looks at, producing an artifact that could not load. That was reverted in `2.0.0`.

### `rollup.config.js`

It exists for one reason: to add `@rollup/plugin-json`, because Rollup cannot parse the
`.json` imports in this widget's dependency tree. Everything else it once contained was
copied from Mendix's RichText widget — CKEditor and `sanitize-html` helpers that were never
called, whose `through2` import broke the build as soon as PWT 11 stopped supplying it
transitively.

### Unused imports are build errors

This widget is TypeScript, so an unused import fails the build with `TS6133` rather than
warning. React 19's automatic JSX runtime makes `import { createElement } from "react"`
unnecessary, and leaving one behind will stop the build.

## References

* [JSONForms](https://jsonforms.io/) — [UI schema reference](https://jsonforms.io/docs/uischema/)
* [JSON Schema](https://json-schema.org/)
* [Pluggable widget property types](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-property-types/)
