// React Hook Form Declarations
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

// Add declarations for any audio files
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

// Add declarations for images if needed
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Add declarations for any CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Add any global ambient declarations
declare namespace JSX {
  interface IntrinsicElements {
    'leva-panel': any;
  }
}

// Add missing JSX intrinsic elements

declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      shaderMaterial: any;
      blackHoleMaterial: any;
      // Add other Three.js components
      mesh: any;
      sphereGeometry: any;
      boxGeometry: any;
      planeGeometry: any;
      icosahedronGeometry: any;
      octahedronGeometry: any;
      torusGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      dodecahedronGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      pointLight: any;
      ambientLight: any;
      directionalLight: any;
      gridHelper: any;
      fog: any;
    }
  }
}