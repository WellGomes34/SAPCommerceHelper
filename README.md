# Commerce Backend Helper

A configurable VS Code extension for generating backend boilerplate code through a dynamic wizard system.

This extension allows you to define code generators declaratively using configuration objects. The UI renders automatically based on your configuration and produces code using template functions.

---

## Overview

Commerce Backend Helper is based on a simple idea:

You define "Wizard Items".
The extension renders the form dynamically.
The user fills it.
The template generates the code.

There is no hardcoded UI per generator.

Everything is configuration-driven.

---

## How It Works

Each generator is defined as a `WizardItem`.

A `WizardItem` contains:

- id (unique identifier)
- label (display name)
- language (output language)
- fields (form structure)
- template (code generator function)

When the user selects an item:

1. The form is built dynamically
2. Required fields are validated
3. Optional fields are supported
4. Dynamic attribute groups can be added
5. The template function generates final code

---

## Project Structure

```
.
├── src
│   ├── extension.ts
│   ├── config
│   │    └── items.ts
│   └── webview
│       ├── wizard.html
│       ├── wizard.js
│       └── wizard.css
├── dist
├── package.json
└── README.md
```

---

## Core Types

### SelectOption

```ts
export type SelectOption = {
  label: string;
  value: string;
};
```

---

### Text Field

```ts
export type TextWizardField = {
  id: string;
  label: string;
  type: 'text';
  placeholder?: string;
  required?: boolean;
  values?: string[] | SelectOption[];
};
```

If `values` is provided, a `<select>` will be rendered instead of an `<input>`.

If `required` is omitted, it defaults to false.

---

### Attributes Field

```ts
export type AttributeField = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  values?: string[] | SelectOption[];
};

export type AttributesWizardField = {
  id: string;
  label: string;
  type: 'attributes';
  fields: AttributeField[];
};
```

This creates a dynamic group where the user can add multiple attribute rows.

Each row follows the structure defined in `fields`.

---

### WizardField Union

```ts
export type WizardField =
  | TextWizardField
  | AttributesWizardField;
```

---

### WizardItem

```ts
export type WizardItem = {
  id: string;
  label: string;
  language: string;
  fields: WizardField[];
  template: (data: any) => string;
};
```

---

## Example: Basic Generator

```ts
export const ITEMS: WizardItem[] = [
  {
    id: 'component',
    label: 'Component',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Component Name',
        type: 'text',
        required: true
      },
      {
        id: 'description',
        label: 'Component Description',
        type: 'text',
        required: false
      }
    ],
    template: data => `
public class ${data.name}Component {

    private String description = "${data.description ?? ''}";

}
`
  }
];
```

---

## Example: Select Field

```ts
{
  id: 'type',
  label: 'Type',
  type: 'text',
  required: true,
  values: [
    { label: 'String', value: 'java.lang.String' },
    { label: 'Integer', value: 'java.lang.Integer' },
    { label: 'Boolean', value: 'boolean' }
  ]
}
```

The user sees the labels.
The template receives the values.

---

## Example: Attributes Field

```ts
{
  id: 'attributes',
  label: 'Attributes',
  type: 'attributes',
  fields: [
    {
      id: 'name',
      label: 'Attribute Name',
      required: true
    },
    {
      id: 'type',
      label: 'Attribute Type',
      required: true,
      values: JAVA_TYPES
    }
  ]
}
```

Generated structure:

```ts
{
  attributes: [
    { name: 'user', type: 'java.lang.String' },
    { name: 'age', type: 'java.lang.Integer' }
  ]
}
```

---

## Reusable Select Lists

To avoid repeating large select arrays:

```ts
export const JAVA_TYPES: SelectOption[] = [
  { label: 'String', value: 'java.lang.String' },
  { label: 'Integer', value: 'java.lang.Integer' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'java.util.Date' }
];
```

Then reuse:

```ts
values: JAVA_TYPES
```

---

## Required Field Behavior

- If `required: true`, the field must be filled
- The Generate button stays disabled until all required fields are valid
- Optional fields automatically display "(optional)" in the label
- If `required` is omitted, it defaults to false

---

## Handling Optional Values in Templates

Use nullish coalescing:

```ts
${data.description ?? ''}
```

Conditional blocks:

```ts
${data.description ? `// ${data.description}` : ''}
```

Attributes example:

```ts
${data.attributes?.map(attr => `
private ${attr.type} ${attr.name};
`).join('\n') ?? ''}
```

---

## Adding a New Generator

1. Open `items.ts`
2. Add a new object inside `ITEMS`
3. Define fields
4. Implement template
5. Done

No UI changes required.

---

## Development

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run in development mode:

Press F5 inside VS Code.

---

## Packaging the Extension

Install vsce:

```bash
npm install -g @vscode/vsce
```

Package:

```bash
vsce package
```

This generates:

```
commerce-backend-helper-x.x.x.vsix
```

Users can install it via:

Extensions → Install from VSIX

---

## Updating the Extension

1. Update the version in `package.json`
2. Run:

```bash
vsce package
```

3. Distribute the new `.vsix`

---

## Recommended .gitignore

```
node_modules
dist
.vscode
*.vsix
```

---

## Design Principles

- Configuration-driven
- Fully dynamic UI
- No duplicated logic
- Easily extensible
- Template-based architecture
- Scalable for large generator sets

---

## License

MIT

---

## Author

Wellington Gomes
