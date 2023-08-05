// Imports
// ========================================================
import QueryProvider from "./query";
import RouterProvider from "./router";

// Root Provider
// ========================================================
const RootProvider = () => {
  return <>
  <QueryProvider>
    <RouterProvider />
  </QueryProvider>
  </>;
};

// Exports
// ========================================================
export default RootProvider;
