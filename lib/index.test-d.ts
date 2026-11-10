import { expectTypeOf } from 'expect-type';

import type {
  AnyScalarFormField,
  AnyStaticFormField,
  BooleanFormField,
  DateFormField,
  Fieldset,
  FieldsetValue,
  FormBlock,
  FormContent,
  FormFields,
  NumberFormField,
  NumberRecordFieldValue,
  NumberRecordFormField,
  OptionalFieldValue,
  RecordArrayFieldValue,
  RequiredFieldValue,
  ScalarFieldValue,
  ScalarFormField,
  SetFormField,
  StaticFormField,
  StringFormField,
  UnknownFormField
} from './index.d.ts';

type ABC = 'a' | 'b' | 'c';
type ABCD = 'a' | 'b' | 'c' | 'd';

/** RequiredFieldValue */
{
  expectTypeOf<Exclude<ScalarFieldValue, undefined>>().toMatchTypeOf<RequiredFieldValue<ScalarFieldValue>>();
  expectTypeOf<{ [key: string]: number }>().toMatchTypeOf<RequiredFieldValue<NumberRecordFieldValue>>();
  expectTypeOf<ABC>().toMatchTypeOf<RequiredFieldValue<string>>();
  expectTypeOf<ABC>().not.toEqualTypeOf<RequiredFieldValue<string>>();
  expectTypeOf<ABC>().toEqualTypeOf<RequiredFieldValue<ABC>>();
  expectTypeOf<ABC>().not.toEqualTypeOf<RequiredFieldValue<ABCD>>();
}

/** OptionalFieldValue */
{
  expectTypeOf<string | undefined>().toMatchTypeOf<OptionalFieldValue<string>>();
  expectTypeOf<RecordArrayFieldValue>().toMatchTypeOf<OptionalFieldValue<FieldsetValue[]>>();
}

/** StringFormField */
{
  expectTypeOf<StringFormField<ABC>>().toMatchTypeOf<StringFormField<ABC>>();
  expectTypeOf<StringFormField<ABC>>().not.toMatchTypeOf<StringFormField<ABCD>>();
}

/** StringFormField - password variant */
{
  type PasswordField = Extract<StringFormField, { variant: 'password' }>;

  expectTypeOf<PasswordField['generatePassword']>().toEqualTypeOf<((this: void) => string) | undefined>();

  // narrowing on the discriminator must reach the method, as consumers do at runtime
  const field = {} as StringFormField;
  if (field.variant === 'password') {
    expectTypeOf(field.generatePassword?.()).toEqualTypeOf<string | undefined>();
  }

  const _password = {
    calculateStrength: () => 4 as const,
    generatePassword: () => '',
    kind: 'string',
    label: '',
    variant: 'password'
  } satisfies StringFormField;

  const _input = {
    // @ts-expect-error - generatePassword is only valid for the password variant
    generatePassword: () => '',
    kind: 'string',
    label: '',
    variant: 'input'
  } satisfies StringFormField;
}

/** StringFormField - combobox variant */
{
  type ComboBoxField = Extract<StringFormField<ABC>, { variant: 'combobox' }>;

  expectTypeOf<ComboBoxField['allowCustomValue']>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<ComboBoxField['variant']>().toEqualTypeOf<'combobox'>();
  expectTypeOf<keyof Extract<StringFormField<ABC>, { options: object }>['options']>().toEqualTypeOf<ABC>();
  expectTypeOf<Extract<StringFormField<ABC>, { options: object }>['variant']>().toEqualTypeOf<
    'combobox' | 'radio' | 'select'
  >();

  // narrowing on the discriminator must reach the flag, as consumers do at runtime
  const field = {} as StringFormField<ABC>;
  if (field.variant === 'combobox') {
    expectTypeOf(field.allowCustomValue).toEqualTypeOf<boolean | undefined>();
  }

  const combobox = {
    allowCustomValue: true,
    kind: 'string',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'combobox'
  } satisfies StringFormField<ABC>;
  expectTypeOf(combobox.allowCustomValue).toEqualTypeOf<true>();

  const _select = {
    // @ts-expect-error - allowCustomValue is only valid for the combobox variant
    allowCustomValue: true,
    kind: 'string',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'select'
  } satisfies StringFormField<ABC>;

  const _formField: FormFields<{ _: string }>['_'] = {
    allowCustomValue: true,
    kind: 'string',
    label: '',
    options: { a: '' },
    variant: 'combobox'
  };
}

/** DateFormField */
{
  expectTypeOf<DateFormField['variant']>().toEqualTypeOf<'date' | 'datetime' | undefined>();

  const _date = { kind: 'date', label: '' } satisfies DateFormField;
  const _datetime = { kind: 'date', label: '', variant: 'datetime' } satisfies DateFormField;
  const _invalid = {
    kind: 'date',
    label: '',
    // @ts-expect-error - variant must be either 'date' or 'datetime'
    variant: 'time'
  } satisfies DateFormField;

  const _formField: FormFields<{ _: Date }>['_'] = {
    kind: 'date',
    label: '',
    variant: 'datetime'
  };
}

/** SetFormField */
{
  expectTypeOf<SetFormField<Set<ABC>>['exclusiveOptions']>().toEqualTypeOf<ABC[] | undefined>();
  expectTypeOf<SetFormField['exclusiveOptions']>().toEqualTypeOf<string[] | undefined>();
  expectTypeOf<ScalarFormField<Set<ABC>>['exclusiveOptions']>().toEqualTypeOf<ABC[] | undefined>();

  const _exclusive = {
    exclusiveOptions: ['c'],
    kind: 'set',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'listbox'
  } satisfies SetFormField<Set<ABC>>;

  // exclusiveOptions is optional, so existing definitions are unaffected
  const _omitted = {
    kind: 'set',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'select'
  } satisfies SetFormField<Set<ABC>>;

  const _invalid = {
    // @ts-expect-error - exclusiveOptions must only contain keys of options
    exclusiveOptions: ['d'],
    kind: 'set',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'listbox'
  } satisfies SetFormField<Set<ABC>>;

  const _formField: FormFields<{ _: Set<ABC> }>['_'] = {
    exclusiveOptions: ['c'],
    kind: 'set',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'listbox'
  };

  const _invalidFormField: FormFields<{ _: Set<ABC> }>['_'] = {
    // @ts-expect-error - exclusiveOptions must only contain keys of options
    exclusiveOptions: ['d'],
    kind: 'set',
    label: '',
    options: { a: '', b: '', c: '' },
    variant: 'listbox'
  };

  const _fieldset: Fieldset<{ _: Set<ABC> }> = {
    _: {
      exclusiveOptions: ['c'],
      kind: 'set',
      label: '',
      options: { a: '', b: '', c: '' },
      variant: 'listbox'
    }
  };

  const _invalidFieldset: Fieldset<{ _: Set<ABC> }> = {
    _: {
      // @ts-expect-error - exclusiveOptions must only contain keys of options
      exclusiveOptions: ['d'],
      kind: 'set',
      label: '',
      options: { a: '', b: '', c: '' },
      variant: 'listbox'
    }
  };
}

/** ScalarFormField */
{
  expectTypeOf<ScalarFormField['kind']>().toMatchTypeOf<AnyScalarFormField['kind']>();
  expectTypeOf<ScalarFormField>().toMatchTypeOf<AnyScalarFormField>();

  expectTypeOf<ScalarFormField<Date>>().toEqualTypeOf<DateFormField>();
  expectTypeOf<ScalarFormField<Set<string>>>().toEqualTypeOf<SetFormField>();
  expectTypeOf<ScalarFormField<Set<string>>>().toEqualTypeOf<SetFormField<Set<string>>>();
  expectTypeOf<keyof ScalarFormField<Set<string>>['options']>().toEqualTypeOf<string>();
  expectTypeOf<ScalarFormField<Set<ABC>>>().toEqualTypeOf<SetFormField<Set<ABC>>>();
  expectTypeOf<keyof ScalarFormField<Set<ABC>>['options']>().toEqualTypeOf<ABC>();
  expectTypeOf<keyof Extract<ScalarFormField<string>, { options: object }>['options']>().toBeString();
  expectTypeOf<keyof Extract<ScalarFormField<ABC>, { options: object }>['options']>().toEqualTypeOf<ABC>();
  expectTypeOf<keyof Extract<ScalarFormField<number>, { options: object }>['options']>().toBeNumber();
  expectTypeOf<keyof Extract<ScalarFormField<1 | 2>, { options: object }>['options']>().toEqualTypeOf<1 | 2>();
  expectTypeOf<ScalarFormField<boolean>>().toEqualTypeOf<BooleanFormField>();
}

/** StaticFormField */
{
  expectTypeOf<StaticFormField['kind']>().toEqualTypeOf<AnyStaticFormField['kind']>();
  expectTypeOf<StaticFormField>().toEqualTypeOf<AnyStaticFormField>();
}

/** UnknownFormField */
{
  expectTypeOf<UnknownFormField<{ _: boolean }>['kind']>().toMatchTypeOf<'boolean' | 'dynamic'>();
  expectTypeOf<UnknownFormField<{ _: RecordArrayFieldValue }>['kind']>().toMatchTypeOf<'dynamic' | 'record-array'>();
  expectTypeOf<UnknownFormField<{ _: number }>['kind']>().toMatchTypeOf<'dynamic' | 'number'>();
  expectTypeOf<keyof Extract<UnknownFormField<{ _: number }>, { options: object }>['options']>().toBeNumber();
  expectTypeOf<keyof Extract<UnknownFormField<{ _: 1 | 2 }>, { options: object }>['options']>().toEqualTypeOf<1 | 2>();
  expectTypeOf<UnknownFormField<{ _: Set<string> }>['kind']>().toMatchTypeOf<'dynamic' | 'set'>();
  expectTypeOf<UnknownFormField<{ _: Set<ABC> }>['kind']>().toMatchTypeOf<'dynamic' | 'set'>();
  expectTypeOf<keyof Extract<UnknownFormField<{ _: Set<string> }>, { options: object }>['options']>().toBeString();
  expectTypeOf<keyof Extract<UnknownFormField<{ _: Set<ABC> }>, { options: object }>['options']>().toEqualTypeOf<ABC>();
  expectTypeOf<UnknownFormField<{ _: string }>['kind']>().toMatchTypeOf<'dynamic' | 'string'>();
  expectTypeOf<keyof Extract<UnknownFormField<{ _: string }>, { options: object }>['options']>().toBeString();
  expectTypeOf<keyof Extract<UnknownFormField<{ _: ABC }>, { options: object }>['options']>().toEqualTypeOf<ABC>();
  expectTypeOf<UnknownFormField<{ _: ABC }>['kind']>().toMatchTypeOf<'dynamic' | 'string'>();
}

/** FormBlock */
{
  expectTypeOf<FormBlock<{ _: string }>['kind']>().toEqualTypeOf<'block'>();
  // a grouped content array accepts blocks alongside field groups
  expectTypeOf<[FormBlock<{ _: string }>]>().toMatchTypeOf<Extract<FormContent<{ _: string }>, unknown[]>>();
}

/** FormFields */
{
  expectTypeOf<FormFields<{ _: boolean }>['_']['kind']>().toMatchTypeOf<'boolean' | 'dynamic'>();
  expectTypeOf<FormFields<{ _: RecordArrayFieldValue }>['_']['kind']>().toMatchTypeOf<'dynamic' | 'record-array'>();
  expectTypeOf<FormFields<{ _: number }>['_']['kind']>().toMatchTypeOf<'dynamic' | 'number'>();
  expectTypeOf<FormFields<{ _: Set<string> }>['_']['kind']>().toMatchTypeOf<'dynamic' | 'set'>();
  expectTypeOf<FormFields<{ _: Set<ABC> }>['_']['kind']>().toMatchTypeOf<'dynamic' | 'set'>();
  expectTypeOf<FormFields<{ _: string }>['_']['kind']>().toMatchTypeOf<'dynamic' | 'string'>();
  expectTypeOf<FormFields<{ _: ABC }>['_']['kind']>().toMatchTypeOf<'dynamic' | 'string'>();

  expectTypeOf<keyof Extract<FormFields<{ _: number }>['_'], { options: object }>['options']>().toBeNumber();
  expectTypeOf<keyof Extract<FormFields<{ _: 1 | 2 }>['_'], { options: object }>['options']>().toEqualTypeOf<1 | 2>();
  expectTypeOf<keyof Extract<FormFields<{ _: Set<string> }>['_'], { options: object }>['options']>().toBeString();
  expectTypeOf<keyof Extract<FormFields<{ _: Set<ABC> }>['_'], { options: object }>['options']>().toEqualTypeOf<ABC>();
  expectTypeOf<keyof Extract<FormFields<{ _: string }>['_'], { options: object }>['options']>().toBeString();
  expectTypeOf<keyof Extract<FormFields<{ _: ABC }>['_'], { options: object }>['options']>().toEqualTypeOf<ABC>();
}

/** NumberFormField - slider variant */
{
  type SliderField = Extract<NumberFormField, { variant: 'slider' }>;

  expectTypeOf<SliderField['defaultValue']>().toEqualTypeOf<number | undefined>();
  expectTypeOf<SliderField['marks']>().toEqualTypeOf<undefined | { [value: number]: string }>();
  expectTypeOf<SliderField['showRange']>().toEqualTypeOf<boolean | undefined>();

  // the new options are optional, so existing slider definitions remain valid
  expectTypeOf<{
    kind: 'number';
    label: string;
    max: number;
    min: number;
    variant: 'slider';
  }>().toMatchTypeOf<NumberFormField>();

  // the slider options do not exist on the other variants
  expectTypeOf<Extract<NumberFormField, { variant: 'input' }>>().not.toHaveProperty('marks');
}

/** NumberRecordFormField */
{
  type Dimensions = { height: number; width: number };
  type Items = { height: { label: string }; width: { label: string } };

  expectTypeOf<{
    items: Items;
    kind: 'number-record';
    label: string;
    variant: 'input';
  }>().toMatchTypeOf<NumberRecordFormField<Dimensions>>();

  expectTypeOf<{
    items: Items;
    kind: 'number-record';
    label: string;
    options: { [key: number]: string };
    variant: 'likert';
  }>().toMatchTypeOf<NumberRecordFormField<Dimensions>>();

  // the likert variant requires options
  expectTypeOf<{
    items: Items;
    kind: 'number-record';
    label: string;
    variant: 'likert';
  }>().not.toMatchTypeOf<NumberRecordFormField<Dimensions>>();

  // each key of the value must have an item
  expectTypeOf<{
    items: { height: { label: string } };
    kind: 'number-record';
    label: string;
    variant: 'input';
  }>().not.toMatchTypeOf<NumberRecordFormField<Dimensions>>();

  // the input variant has no options
  expectTypeOf<Extract<NumberRecordFormField, { variant: 'input' }>>().not.toHaveProperty('options');

  // a number record field remains assignable to the form content for its data type
  expectTypeOf<{
    dimensions: { items: Items; kind: 'number-record'; label: string; variant: 'input' };
  }>().toMatchTypeOf<FormFields<{ dimensions: Dimensions }>>();
}
