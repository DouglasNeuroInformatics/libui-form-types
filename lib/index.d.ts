import type { RequiredDeep, SetNonNullable, Simplify } from 'type-fest';

// FIELD KINDS (DISCRIMINATOR KEY)

export type StaticCompositeFieldKind = 'fieldset-array' | 'numeric-fieldset';

export type StaticScalarFieldKind = 'boolean' | 'date' | 'number' | 'set' | 'string';

export type StaticFieldKind = Simplify<StaticCompositeFieldKind | StaticScalarFieldKind>;

// BASE DATA TYPES

export type ScalarFieldValue = Date | Set<string> | boolean | number | string | undefined;

export type FieldsetValue = Record<string, ScalarFieldValue>;

export type FieldsetArrayFieldValue = FieldsetValue[] | undefined;

export type NumericFieldsetFieldValue = Partial<Record<string, number>> | undefined;

export type CompositeFieldValue = FieldsetArrayFieldValue | NumericFieldsetFieldValue;

export type FormFieldValue = CompositeFieldValue | ScalarFieldValue;

/** The type of the data associated with the entire instrument (i.e., the values for all fields) */
export type FormDataType = Record<string, FormFieldValue>;

// REQUIRED DATA TYPES

export type RequiredFormFieldValue<TValue extends FormFieldValue = FormFieldValue> =
  TValue extends infer TScalarValue extends NonNullable<ScalarFieldValue>
    ? TScalarValue
    : TValue extends infer TCompositeValue extends NonNullable<CompositeFieldValue>
      ? TCompositeValue extends (infer TArrayItem)[]
        ? Required<TArrayItem>[]
        : Required<TCompositeValue>
      : never;

export type OptionalFormFieldValue<
  TValue extends FormFieldValue = FormFieldValue,
  TNull extends null = never
> = TValue extends infer TScalarValue extends NonNullable<ScalarFieldValue>
  ? TNull | TScalarValue | undefined
  : TValue extends infer TCompositeValue extends NonNullable<CompositeFieldValue>
    ? TCompositeValue extends (infer TArrayItem)[]
      ? Partial<TArrayItem>[] | TNull | undefined
      : Partial<TCompositeValue> | TNull | undefined
    : never;

export type RequiredFormDataType<TData extends FormDataType = FormDataType> = {
  [K in keyof TData]-?: RequiredFormFieldValue<TData[K]>;
};

export type PartialFormDataType<TData extends FormDataType = FormDataType> = {
  [K in keyof TData]?: OptionalFormFieldValue<TData[K]>;
};

export type PartialNullableFormDataType<TData extends FormDataType = FormDataType> = {
  [K in keyof TData]?: OptionalFormFieldValue<TData[K], null>;
};

/** The basic properties common to all field kinds */
export type BaseFormField = {
  /** An optional description of this field */
  description?: string;

  /** Discriminator key */
  kind: StaticFieldKind;

  /** The label to be displayed to the user */
  label: string;
};

/**
 * A helper type used to merge `BaseFormField` with `T`, where kind determines
 * the data type stored in the form and variant determines what will be rendered
 * to the user, if applicable
 */
export type FormFieldMixin<TField extends { kind: StaticFieldKind }> = Simplify<BaseFormField & TField>;

export type TextFormField<TValue extends string = string> = FormFieldMixin<
  | {
      kind: 'string';
      options: Record<TValue, string>;
      variant: 'radio' | 'select';
    }
  | {
      kind: 'string';
      variant: 'input' | 'password' | 'textarea';
    }
>;

export type NumberFormField<TValue extends number = number> = FormFieldMixin<
  | {
      kind: 'number';
      max: number;
      min: number;
      variant: 'slider';
    }
  | {
      kind: 'number';
      max?: number;
      min?: number;
      variant: 'input';
    }
  | {
      kind: 'number';
      options: Record<TValue, string>;
      variant: 'radio';
    }
>;

export type DateFormField = FormFieldMixin<{
  kind: 'date';
}>;

export type BooleanFormField = FormFieldMixin<
  | {
      kind: 'boolean';
      options?: {
        false: string;
        true: string;
      };
      variant: 'radio';
    }
  | {
      kind: 'boolean';
      variant: 'checkbox';
    }
>;

export type SetFormField<TValue extends Set<string> = Set<string>> = FormFieldMixin<{
  kind: 'set';
  options: Record<TValue extends Set<infer TItem extends string> ? TItem : never, string>;
  variant: 'listbox' | 'select';
}>;

/** A field where the underlying value of the field data is of type FormFieldValue */
export type ScalarFormField<TValue extends NonNullable<ScalarFieldValue> = NonNullable<ScalarFieldValue>> =
  TValue extends object
    ? TValue extends Date
      ? DateFormField
      : TValue extends Set<string>
        ? SetFormField<TValue>
        : never
    : TValue extends string
      ? TextFormField<TValue>
      : TValue extends number
        ? NumberFormField<TValue>
        : TValue extends boolean
          ? BooleanFormField
          : never;

export type DynamicFieldsetField<TFieldsetValue extends FieldsetValue, TValue extends NonNullable<ScalarFieldValue>> = {
  kind: 'dynamic';
  render: (fieldset: Partial<TFieldsetValue>) => ScalarFormField<TValue> | null;
};

export type Fieldset<TFieldsetValue extends SetNonNullable<FieldsetValue>> = {
  [K in keyof TFieldsetValue]:
    | DynamicFieldsetField<TFieldsetValue, TFieldsetValue[K]>
    | ScalarFormField<TFieldsetValue[K]>;
};

export type FieldsetArrayFormField<
  TValue extends RequiredDeep<FieldsetArrayFieldValue> = RequiredDeep<FieldsetArrayFieldValue>
> = FormFieldMixin<{
  fieldset: Fieldset<TValue[number]>;
  kind: 'fieldset-array';
}>;

export type StaticFormField<TValue extends RequiredFormFieldValue> =
  TValue extends NonNullable<ScalarFieldValue>
    ? ScalarFormField<TValue>
    : TValue extends RequiredDeep<FieldsetArrayFieldValue>
      ? FieldsetArrayFormField<TValue>
      : FieldsetArrayFormField | ScalarFormField;

export type StaticFormFields<
  TData extends FormDataType,
  TRequiredData extends RequiredFormDataType<TData> = RequiredFormDataType<TData>
> = {
  [K in keyof TRequiredData]: StaticFormField<TRequiredData[K]>;
};

export type DynamicFormField<
  TData extends FormDataType,
  TValue extends RequiredFormFieldValue = RequiredFormFieldValue
> = {
  deps: readonly Extract<keyof TData, string>[];
  kind: 'dynamic';
  render: (data: PartialFormDataType<TData> | null) => StaticFormField<TValue> | null;
};

export type UnknownFormField<
  TData extends FormDataType = FormDataType,
  TKey extends keyof TData = keyof TData,
  TRequiredData extends RequiredFormDataType<TData> = RequiredFormDataType<TData>
> = DynamicFormField<TData, TRequiredData[TKey]> | StaticFormField<TRequiredData[TKey]>;

export type FormFields<TData extends FormDataType = FormDataType> = {
  [K in keyof TData]-?: UnknownFormField<TData, K>;
};

export type FormFieldsGroup<TData extends FormDataType> = {
  description?: string;
  fields: {
    [K in keyof TData]?: UnknownFormField<RequiredFormDataType<TData>, K>;
  };
  title: string;
};

export type FormContent<TData extends FormDataType = FormDataType> = FormFields<TData> | FormFieldsGroup<TData>[];
