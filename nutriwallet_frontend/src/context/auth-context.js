import { createContext } from "react";

/**
 * AuthContext — context object cho authentication.
 * Theo cùng pattern với theme-context.js để nhất quán.
 *
 * Giá trị được cung cấp bởi AuthProvider trong AuthContext.jsx.
 */
export const AuthContext = createContext(null);
