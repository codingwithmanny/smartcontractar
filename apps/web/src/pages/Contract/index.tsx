// Imports
// ========================================================
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Outlet } from 'react-router-dom';

// Main Render
// ========================================================
const ContractPage = () => {
  // State / Props
  // const [content, setContent] = useState<any>()
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // console.log({ pathname });
  // const [isInitLoading, setIsInitLoading] = useState<boolean>(true);
  const { contractId } = useParams<{ contractId: string }>();
  // const [diff, setDiff] = useState<any>();

  // Requests
  const contractRead = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      // try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contracts/${contractId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await response.json();
      return json;
    },
  });

  const transactionsList = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      // try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contracts/${contractId}/transactions?order=timestamp&sort=asc`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await response.json();
      return json;
    },
    enabled: contractRead.data?.data?.contractId ? true : false,
  });

  // const transactionsPull = useQuery({
  //   queryKey: [],
  //   queryFn: async () => {
  //     // try {
  //     const response = await fetch(
  //       `${
  //         import.meta.env.VITE_API_URL
  //       }/contracts/${contractId}/transactions/pull`
  //     );
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     const json = await response.json();
  //     return json;
  //   },
  //   enabled: false,
  //   onSuccess: () => {
  //     transactionsList.refetch();
  //     contractRead.refetch();
  //   },
  // });

  // const isLoading = contractRead.isLoading || transactionsList.isLoading;

  // Hooks
  useEffect(() => {
    if (!transactionsList?.data?.data) return;
    console.log(transactionsList?.data?.data);
    console.log(contractRead.data?.data?.totalTxs);
    const init = async () => {
      if (contractRead.data?.data?.totalTxs) return;
      // transactionsPull.refetch();
    };

    init();
  }, [transactionsList?.data]);

//   const test = async () => {
//     console.log('test');
//     const file = await unified()
//       .use(remarkParse)
//       .use(remarkGfm)
//       .use(remarkRehype)
//       // // .use(rehypePrettyCode, {
//       // //   // See Options section below.
//       // // })
//       .use(remarkHighlightjs)
//       // .use(rehypeParse, {fragment: true})
//       .use(rehypeStringify)
//       // .use(rehypeReact, {createElement, Fragment})
//       .processSync(`\`\`\`js {1}
//         console.log("Hello world!");
//         console.log("Goodbye")
// \`\`\``);
//       setContent(file.value); 
//       console.log(file);
//   };

//   useEffect(() => {
//     if (content) return;
//     test();
//   }, []);

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
      <nav className=" bg-zinc-50 flex border-t border-zinc-100" aria-label="Tabs">
        <ul className="flex w-full">
          <li className="w-1/4 border-b border-white">
        <Link
          className={`${!pathname.endsWith('/state') && !pathname.endsWith('/code') && !pathname.endsWith('/notifications') ? 'text-zinc-800 bg-white border-indigo-600' : 'text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent'} flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
          to={`/contract/${contractId}`}
        >
          Transactions
        </Link>
        </li>
        <li className="w-1/4 border-b border-zinc-100">
        <Link
          className={`${pathname.endsWith('/state') ? 'text-zinc-800 bg-white border-indigo-600' : 'text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent'} flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
          to={`/contract/${contractId}/state`}
        >
          State
        </Link>
        </li>
        <li className="w-1/4 border-b border-zinc-100">
        <Link
          className={`${pathname.endsWith('/code') ? 'text-zinc-800 bg-white border-indigo-600' : 'text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent'} flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
          to={`/contract/${contractId}/code`}
        >
          Code
        </Link>
        </li>
        <li className="w-1/4 border-b border-zinc-100">
        <Link
          className={`${pathname.endsWith('/notifications') ? 'text-zinc-800 bg-white border-indigo-600' : 'text-zinc-500 hover:border-zinc-300 hover:bg-white/50 hover:text-zinc-700 border-transparent'} flex justify-center border-b-2 py-4 px-1 text-center text-sm font-medium`}
          to={`/contract/${contractId}/notifications`}
        >
          Notifications
        </Link>
        </li>
        </ul>
      </nav>
      <Outlet />
      {/* <main>
        <div className="p-8">
          <div id="diff">
          <ReactDiffViewer
          leftTitle={"Initial State"}
          rightTitle={"Current State"}
          splitView={true}
            oldValue={JSON.stringify(contractRead.data?.data?.initState, null, 2)}
            newValue={JSON.stringify(currentTx.data?.data[0]?.after, null, 2)}
            renderContent={(str: string) => {
              if (!str) return (<></>)
              return <span
                style={{ display: 'inline' }}
                dangerouslySetInnerHTML={{
                  __html: Prism.highlight(str, Prism.languages.json, 'json'),
                }}
              />
            }}
          />
          </div>


          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {contractRead.isError ? (
                <>
                  <h3>Error Retrieving Contract Data</h3>{" "}
                  <p>Double check the contract transaction id.</p>
                </>
              ) : (
                <>

                  <div className="flex space-x-8">
                    <div className="w-1/2">
                      <h3>Initial State</h3>

                      <pre>
                        <code>
                          {JSON.stringify(
                            contractRead.data?.data?.initState,
                            null,
                            2
                          )}
                        </code>
                      </pre>
                    </div>

                    <div className="w-1/2">
                      <h3>Current State</h3>
                      {currentTx.data?.data?.length > 0 ? (
                        <>
                          <pre>
                            <code>
                              {JSON.stringify(
                                currentTx.data?.data[0]?.after,
                                null,
                                2
                              )}
                            </code>
                          </pre>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <h3>Source Code</h3>

                  <pre>
                    <code>{contractRead.data?.data?.sourceCode}</code>
                  </pre>

                  <h3>Original Contract Data</h3>

                  <pre>
                    <code>
                      {JSON.stringify(contractRead.data?.data?.data, null, 2)}
                    </code>
                  </pre>

                  <h3>
                    Transactions{" "}
                    <span className="text-zinc-500">
                      Total: {contractRead?.data?.data.totalTxs}
                    </span>
                  </h3>

                  <div className="flex space-x-8">
                    <div
                      className={`${diff ? "w-1/2" : "w-full"} overflow-scroll`}
                    >
                      <table className="mb-8">
                        <thead>
                          <tr>
                            <th>Transaction ID</th>
                            <th>Block ID</th>
                            <th>Block Height</th>
                            <th>Timestamp</th>
                            <th>Owner Address</th>
                            <th>View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactionsList.data?.data?.map(
                            (transaction: any) => (
                              <tr key={`tx-${transaction.transactionId}`}>
                                <td>{transaction.transactionId}</td>
                                <td>{transaction.blockId}</td>
                                <td>{transaction.blockHeight}</td>
                                <td>{transaction.timestamp}</td>
                                <td>{transaction.ownerAddress}</td>
                                <td>
                                  <button
                                    onClick={() => {
                                      setDiff({
                                        error: transaction.error,
                                        before: transaction.before,
                                        after: transaction.after,
                                      });
                                    }}
                                    type="button"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                    {diff ? (
                      <div className="w-1/2">
                        <h4>Diff</h4>
                        {diff?.error ? (
                          <div>
                            <h5>Error</h5>
                            <pre>
                              <code>{diff?.error}</code>
                            </pre>
                          </div>
                        ) : null}
                        <div className="flex space-x-8">
                          <div className="w-1/2 overflow-scroll">
                            <h5>Before</h5>
                            <pre>
                              <code>
                                {JSON.stringify(diff?.before, null, 2)}
                              </code>
                            </pre>
                          </div>
                          <div className="w-1/2 overflow-scroll">
                            <h5>After</h5>
                            <pre>
                              <code>
                                {JSON.stringify(diff?.after, null, 2)}
                              </code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {isInitLoading ? (
          <div className="bg-zinc-50 fixed inset-0 flex items-center justify-center">
            <div className="bg-white shadow-sm p-8 inline-flex justify-center items-center rounded-lg">
              <IconLoader2 className=" text-zinc-500 animate-spin" />
            </div>
          </div>
        ) : null}
      </main> */}
    </>
  );
};

// Exports
// ========================================================
export default ContractPage;
