import React from 'react';

export const useSearchParams = (): [URLSearchParams, (params: URLSearchParams) => void] => [
  new URLSearchParams(), 
  jest.fn()
];

export const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => children as React.ReactElement;
export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => children as React.ReactElement;
export const Route: React.FC<{ children: React.ReactNode }> = ({ children }) => children as React.ReactElement;
export const Link: React.FC<{ children: React.ReactNode; to: string }> = ({ children, to }) => React.createElement('a', { href: to }, children);
