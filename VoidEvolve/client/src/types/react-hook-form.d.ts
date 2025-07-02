// Create a type declaration file for react-hook-form
declare module 'react-hook-form' {
  export type FieldValues = Record<string, any>;
  export type FieldPath<TFieldValues extends FieldValues> = string;
  
  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    register: (name: string) => any;
    handleSubmit: (onSubmit: (data: TFieldValues) => void) => (e: any) => void;
    formState: {
      errors: Record<string, any>;
      isSubmitting: boolean;
    };
    reset: () => void;
    setValue: (name: string, value: any) => void;
    watch: (name?: string) => any;
    control: any;
  }
  
  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    options?: any
  ): UseFormReturn<TFieldValues>;
  
  export interface ControllerProps {
    name: string;
    control?: any;
    defaultValue?: any;
    render: (props: any) => React.ReactElement;
  }
  
  export function Controller(props: ControllerProps): JSX.Element;
  export function FormProvider(props: any): JSX.Element;
}