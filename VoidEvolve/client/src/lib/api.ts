import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
});

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText: string;
    
    try {
      const data = await res.json();
      errorText = data.message || data.error || res.statusText;
    } catch (error) {
      errorText = res.statusText;
    }
    
    throw new Error(`API Error: ${errorText}`);
  }
  
  return res;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `/api/${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  await throwIfResNotOk(res);
  
  return res.json();
}