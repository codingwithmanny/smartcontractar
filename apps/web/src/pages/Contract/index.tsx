// Imports
// ========================================================
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

// Main Render
// ========================================================
const ContractPage = () => {
  // State / Props
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isInitLoading, setIsInitLoading] = useState<boolean>(true);
  const { contractId } = useParams<{ contractId: string }>();

  // Requests
  /**
   *
   */
  const contractRead = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contracts/${contractId}`
      );
      if (!response.ok) {
        throw new Error("Not found.");
      }
      const json = await response.json();
      return json;
    },
  });

  /**
   *
   */
  const isLoading = contractRead.isLoading;

  /**
   *
   */
  const isError = contractRead.isError;

  // Hooks
  useEffect(() => {
    if (isLoading) return;
    setIsInitLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Render
  return (
    <>
      <nav className="border-b border-zinc-100">
        <div className="p-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/contract/${event.currentTarget.search.value}`);
            }}
          >
            <div className="relative">
              <input
                className="border border-zinc-200 leading-[3rem] rounded-lg pl-12 pr-4 w-full shadow-sm"
                name="search"
                type="text"
                placeholder="Contact Address (Ex: yZUcvwOin4FspimDAbkncgi5XL-Cu8_gmkSBeLSLT8E)"
              />
              <IconSearch
                size={20}
                className="text-zinc-300 absolute top-0 bottom-0 left-4 my-auto "
              />
            </div>
          </form>
        </div>
      </nav>

      {!isError ? (
        <>
          <header className="p-8">
            <div className="flex w-full justify-between">
              <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl mb-3">
                Contract{" "}
                <span className="inline-flex -translate-y-1 bg-indigo-600 text-white font-medium leading-6 text-xs px-2 rounded">
                  {contractRead.data?.data?.network}
                </span>
              </h1>
            </div>
            <h2 className="text-lg text-zinc-500 mb-4">{contractId}</h2>
            <div className="bg-zinc-100 inline-flex text-zinc-500 text-sm shadow-sm leading-7 px-3 rounded-lg border border-zinc-200">
              <span className="mr-3 font-medium border-r pr-3">OWNER</span>
              <span className="font-mono">
                {contractRead.data?.data?.ownerAddress}
              </span>
            </div>
          </header>
          <nav
            className=" bg-zinc-50 flex border-t border-zinc-100"
            aria-label="Tabs"
          >
            <ul className="flex w-full">
              <li className="w-1/4 border-b border-white">
                <Link
                  className={`${
                    !pathname.endsWith("/state") &&
                    !pathname.endsWith("/code") &&
                    !pathname.endsWith("/notifications")
                      ? "text-zinc-800 bg-white border-indigo-600"
                      : "text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent"
                  } flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
                  to={`/contract/${contractId}`}
                >
                  Transactions
                </Link>
              </li>
              <li className="w-1/4 border-b border-zinc-100">
                <Link
                  className={`${
                    pathname.endsWith("/state")
                      ? "text-zinc-800 bg-white border-indigo-600"
                      : "text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent"
                  } flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
                  to={`/contract/${contractId}/state`}
                >
                  State
                </Link>
              </li>
              <li className="w-1/4 border-b border-zinc-100">
                <Link
                  className={`${
                    pathname.endsWith("/code")
                      ? "text-zinc-800 bg-white border-indigo-600"
                      : "text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent"
                  } flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
                  to={`/contract/${contractId}/code`}
                >
                  Code
                </Link>
              </li>
              <li className="w-1/4 border-b border-zinc-100">
                <Link
                  className={`${
                    pathname.endsWith("/notifications")
                      ? "text-zinc-800 bg-white border-indigo-600"
                      : "text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent"
                  } flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
                  to={`/contract/${contractId}/notifications`}
                >
                  Notifications
                </Link>
              </li>
            </ul>
          </nav>
          <Outlet />
        </>
      ) : (
        <>
          <header className="p-8">
            <div className="flex w-full justify-between">
              <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl mb-3">
                Error Retrieving Contract
              </h1>
            </div>
            <h2 className="text-lg text-zinc-500 mb-4">{contractId}</h2>
          </header>
        </>
      )}

      {isInitLoading ? (
        <div className="bg-zinc-50 fixed inset-0 flex items-center justify-center">
          <div className="bg-white shadow-sm p-8 inline-flex justify-center items-center rounded-lg">
            <IconLoader2 className=" text-zinc-500 animate-spin" />
          </div>
        </div>
      ) : null}
    </>
  );
};

// Exports
// ========================================================
export default ContractPage;
