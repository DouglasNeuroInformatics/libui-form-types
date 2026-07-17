import { expectTypeOf } from 'expect-type';

import type {
  AnyScalarFormField,
  AnyStaticFormField,
  BooleanFormField,
  DateFormField,
  FieldsetValue,
  FormBlock,
  FormContent,
  FormFields,
  NumberRecordFieldValue,
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
