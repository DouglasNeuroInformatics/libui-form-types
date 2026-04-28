import type { IntRange, Simplify } from 'type-fest';

/** @public */
declare namespace FormTypes {
  // INTERNAL UTILITIES
  export type NonNullableRecord<T> =
    NonNullable<T> extends infer U extends { [key: string]: unknown }
      ? {
          [K in keyof U]-?: NonNullable<U[K]>;
        }
      : never;

  // FIELD KINDS (DISCRIMINATOR KEY)

  export type StaticCompositeFieldKind = 'number-record' | 'record-array';

  export type StaticScalarFieldKind = 'boolean' | 'date' | 'number' | 'set' | 'string';

  export type StaticFieldKind = Simplify<StaticCompositeFieldKind | StaticScalarFieldKind>;

  // BASE DATA TYPES

  export type ScalarFieldValue = boolean | Date | number | Set<string> | string | undefined;

  export type FieldsetValue = { [key: string]: ScalarFieldValue };

  export type RecordArrayFieldValue = FieldsetValue[] | undefined;

  export type NumberRecordFieldValue = Partial<{ [key: string]: number }> | undefined;

  export type CompositeFieldValue = NumberRecordFieldValue | RecordArrayFieldValue;

  export type FieldValue = CompositeFieldValue | ScalarFieldValue;

  /** The type of the data associated with the entire instrument (i.e., the values for all fields) */
  export type Data = { [key: string]: FieldValue };

  // REQUIRED DATA TYPES

  export type RequiredFieldValue<TValue extends FieldValue = FieldValue> = TValue extends infer TScalarValue extends
    NonNullable<ScalarFieldValue>
    ? TScalarValue
    : TValue extends infer TCompositeValue extends NonNullable<CompositeFieldValue>
      ? TCompositeValue extends (infer TArrayItem)[]
        ? NonNullableRecord<TArrayItem>[]
        : NonNullableRecord<TCompositeValue>
      : never;

  export type OptionalFieldValue<
    TValue extends FieldValue = FieldValue,
    TNull extends null = never
  > = TValue extends infer TScalarValue extends NonNullable<ScalarFieldValue>
    ? TNull | TScalarValue | undefined
    : TValue extends infer TCompositeValue extends NonNullable<CompositeFieldValue>
      ? TCompositeValue extends (infer TArrayItem)[]
        ? Partial<TArrayItem>[] | TNull | undefined
        : Partial<TCompositeValue> | TNull | undefined
      : never;

  export type RequiredData<TData extends Data = Data> = {
    [K in keyof TData]-?: RequiredFieldValue<TData[K]>;
  };

  export type PartialData<TData extends Data = Data> = {
    [K in keyof TData]?: OptionalFieldValue<TData[K]>;
  };

  export type PartialNullableData<TData extends Data = Data> = {
    [K in keyof TData]?: OptionalFieldValue<TData[K], null>;
  };

  /** The basic properties common to all field kinds */
  export type BaseField = {
    /** An optional description of this field */
    description?: string;

    /** Whether or not the field is disabled */
    disabled?: boolean;

    /** Discriminator key */
    kind: StaticFieldKind;

    /** The label to be displayed to the user */
    label: string;
  };

  /**
   * A helper type used to merge `BaseField` with `T`, where kind determines
   * the data type stored in the form and variant determines what will be rendered
   * to the user, if applicable
   */
  export type FieldMixin<TField extends { kind: StaticFieldKind }> = Simplify<BaseField & TField>;

  export type StringField<TValue extends string = string> = FieldMixin<
    | {
        calculateStrength?: (this: void, password: string) => IntRange<0, 5>;
        kind: 'string';
        variant: 'password';
      }
    | {
        kind: 'string';
        options: { [K in TValue]: string };
        variant: 'radio' | 'select';
      }
    | {
        kind: 'string';
        placeholder?: string;
        variant: 'input' | 'textarea';
      }
  >;

  export type NumberField<TValue extends number = number> = FieldMixin<
    | {
        disableAutoPrefix?: boolean;
        kind: 'number';
        options: { [K in TValue]: string };
        variant: 'radio' | 'select';
      }
    | {
        kind: 'number';
        /** @deprecated - this should be defined in the validationSchema for better use feedback  */
        max?: number;
        /** @deprecated - this should be defined in the validationSchema for better use feedback  */
        min?: number;
        variant: 'input';
      }
    | {
        kind: 'number';
        max: number;
        min: number;
        variant: 'slider';
      }
  >;

  export type DateField = FieldMixin<{
    kind: 'date';
  }>;

  export type BooleanField = FieldMixin<
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

  export type SetField<TValue extends Set<string> = Set<string>> = FieldMixin<{
    kind: 'set';
    options: TValue extends Set<infer TItem extends string>
      ? {
          [K in TItem]: string;
        }
      : never;
    variant: 'listbox' | 'select';
  }>;

  export type AnyScalarField = BooleanField | DateField | NumberField | SetField | StringField;

  /** A field where the underlying value of the field data is of type ScalarFieldValue */
  export type ScalarField<TValue extends RequiredFieldValue<ScalarFieldValue> = RequiredFieldValue<ScalarFieldValue>> =
    [TValue] extends [object]
      ? [TValue] extends [Date]
        ? DateField
        : [TValue] extends [Set<string>]
          ? SetField<TValue>
          : never
      : [TValue] extends [string]
        ? StringField<TValue>
        : [TValue] extends [number]
          ? NumberField<TValue>
          : [TValue] extends [boolean]
            ? BooleanField
            : AnyScalarField;

  export type DynamicFieldsetField<
    TFieldsetValue extends FieldsetValue,
    TValue extends RequiredFieldValue<ScalarFieldValue>
  > = {
    kind: 'dynamic';
    render: (this: void, fieldset: Partial<TFieldsetValue>) => null | ScalarField<TValue>;
  };

  export type Fieldset<TFieldsetValue extends NonNullableRecord<FieldsetValue>> = {
    [K in keyof TFieldsetValue]:
      | DynamicFieldsetField<TFieldsetValue, TFieldsetValue[K]>
      | ScalarField<TFieldsetValue[K]>;
  };

  export type RecordArrayField<
    TValue extends RequiredFieldValue<RecordArrayFieldValue> = RequiredFieldValue<RecordArrayFieldValue>
  > = FieldMixin<{
    fieldset: Fieldset<TValue[number]>;
    kind: 'record-array';
  }>;

  export type NumberRecordField<
    TValue extends RequiredFieldValue<NumberRecordFieldValue> = RequiredFieldValue<NumberRecordFieldValue>
  > = FieldMixin<{
    items: {
      [K in keyof TValue]: {
        description?: string;
        label: string;
      };
    };
    kind: 'number-record';
    options: { [key: number]: string };
    variant: 'likert';
  }>;

  export type CompositeField<TValue extends RequiredFieldValue<CompositeFieldValue>> =
    TValue extends RequiredFieldValue<RecordArrayFieldValue>
      ? RecordArrayField<TValue>
      : TValue extends RequiredFieldValue<NumberRecordFieldValue>
        ? NumberRecordField<TValue>
        : never;

  export type AnyStaticField =
    | BooleanField
    | DateField
    | NumberField
    | NumberRecordField
    | RecordArrayField
    | SetField
    | StringField;

  export type StaticField<TValue extends RequiredFieldValue = RequiredFieldValue> = [TValue] extends [
    RequiredFieldValue<ScalarFieldValue>
  ]
    ? ScalarField<TValue>
    : [TValue] extends [RequiredFieldValue<CompositeFieldValue>]
      ? [TValue] extends [RequiredFieldValue<RecordArrayFieldValue>]
        ? RecordArrayField<TValue>
        : [TValue] extends [RequiredFieldValue<NumberRecordFieldValue>]
          ? NumberRecordField<TValue>
          : never
      : AnyStaticField;

  export type StaticFields<TData extends Data, TRequiredData extends RequiredData<TData> = RequiredData<TData>> = {
    [K in keyof TRequiredData]: StaticField<TRequiredData[K]>;
  };

  export type DynamicField<TData extends Data, TValue extends RequiredFieldValue = RequiredFieldValue> = {
    deps: readonly Extract<keyof TData, string>[];
    kind: 'dynamic';
    render: (this: void, data: PartialData<TData>) => null | StaticField<TValue>;
  };

  export type UnknownField<
    TData extends Data = Data,
    TKey extends keyof TData = keyof TData,
    TRequiredData extends RequiredData<TData> = RequiredData<TData>
  > = DynamicField<TData, TRequiredData[TKey]> | StaticField<TRequiredData[TKey]>;

  export type Fields<TData extends Data = Data> = {
    [K in keyof TData]-?: UnknownField<TData, K>;
  };

  export type FieldsGroup<TData extends Data> = {
    description?: string;
    fields: {
      [K in keyof TData]?: UnknownField<RequiredData<TData>, K>;
    };
    title?: string;
  };

  export type Content<TData extends Data = Data> = Fields<TData> | FieldsGroup<TData>[];
}

export import NonNullableRecord = FormTypes.NonNullableRecord;
export import StaticCompositeFieldKind = FormTypes.StaticCompositeFieldKind;
export import StaticScalarFieldKind = FormTypes.StaticScalarFieldKind;
export import StaticFieldKind = FormTypes.StaticFieldKind;
export import ScalarFieldValue = FormTypes.ScalarFieldValue;
export import FieldsetValue = FormTypes.FieldsetValue;
export import RecordArrayFieldValue = FormTypes.RecordArrayFieldValue;
export import NumberRecordFieldValue = FormTypes.NumberRecordFieldValue;
export import CompositeFieldValue = FormTypes.CompositeFieldValue;
export import FormFieldValue = FormTypes.FieldValue;
export import FormDataType = FormTypes.Data;
export import RequiredFieldValue = FormTypes.RequiredFieldValue;
export import OptionalFieldValue = FormTypes.OptionalFieldValue;
export import RequiredFormDataType = FormTypes.RequiredData;
export import PartialFormDataType = FormTypes.PartialData;
export import PartialNullableFormDataType = FormTypes.PartialNullableData;
export import BaseFormField = FormTypes.BaseField;
export import FormFieldMixin = FormTypes.FieldMixin;
export import StringFormField = FormTypes.StringField;
export import NumberFormField = FormTypes.NumberField;
export import DateFormField = FormTypes.DateField;
export import BooleanFormField = FormTypes.BooleanField;
export import SetFormField = FormTypes.SetField;
export import AnyScalarFormField = FormTypes.AnyScalarField;
export import ScalarFormField = FormTypes.ScalarField;
export import DynamicFieldsetField = FormTypes.DynamicFieldsetField;
export import Fieldset = FormTypes.Fieldset;
export import RecordArrayFormField = FormTypes.RecordArrayField;
export import NumberRecordFormField = FormTypes.NumberRecordField;
export import CompositeFormField = FormTypes.CompositeField;
export import AnyStaticFormField = FormTypes.AnyStaticField;
export import StaticFormField = FormTypes.StaticField;
export import StaticFormFields = FormTypes.StaticFields;
export import DynamicFormField = FormTypes.DynamicField;
export import UnknownFormField = FormTypes.UnknownField;
export import FormFields = FormTypes.Fields;
export import FormFieldsGroup = FormTypes.FieldsGroup;
export import FormContent = FormTypes.Content;

export default FormTypes;
