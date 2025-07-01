export const useSearchParams = () => [new URLSearchParams(), jest.fn()];
export const BrowserRouter = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ children }) => children;
export const Link = ({ children, to }) => <a href={to}>{children}</a>;
