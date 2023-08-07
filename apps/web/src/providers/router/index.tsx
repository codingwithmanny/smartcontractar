// Imports
// ========================================================
import { createBrowserRouter, RouterProvider as BrowserProvider, createRoutesFromElements, Route } from 'react-router-dom';
// Routes
// - Layouts
import MainLayout from '../../layouts/Main';
// - Pages
import Home from '../../pages/Home';
import Contract from '../../pages/Contract';
import ContractTransactions from '../../pages/ContractTransactions';
import ContractState from '../../pages/ContractState';
import ContractCode from '../../pages/ContractCode';
import ContractNotifications from '../../pages/ContractNotifications';

// Config
// ========================================================
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="/contract/:contractId" element={<Contract />}>
        <Route index element={<ContractTransactions />} />
        <Route path="state" element={<ContractState />} />
        <Route path="code" element={<ContractCode />} />
        <Route path="notifications" element={<ContractNotifications />} />
      </Route>
    </Route>
  )
);

// Provider
// ========================================================
const RouterProvider = () => {
  return <BrowserProvider router={router} />
};

// Exports
// ========================================================
export default RouterProvider;
