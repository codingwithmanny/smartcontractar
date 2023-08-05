// Imports
// ========================================================
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Main Render
// ========================================================
const ContractPage = () => {
  // State / Props
  const { contractId } = useParams<{ contractId: string }>();
  const [diff, setDiff] = useState<any>();

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

  const currentTx = useQuery({
    queryKey: ["currentState"],
    queryFn: async () => {
      // try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contracts/${contractId}/transactions?order=timestamp&sort=desc&limit=1`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await response.json();
      return json;
    },
    enabled: contractRead.data?.data?.contractId ? true : false,
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

  const transactionsPull = useQuery({
    queryKey: undefined,
    queryFn: async () => {
      // try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contracts/${contractId}/transactions/pull`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await response.json();
      return json;
    },
    enabled: false,
    onSuccess: () => {
      transactionsList.refetch();
      contractRead.refetch();
    },
  });

  const isLoading =
    contractRead.isLoading ||
    transactionsList.isLoading;

  // Hooks
  useEffect(() => {
    if (!transactionsList?.data?.data) return
    console.log(transactionsList?.data?.data)
    console.log(contractRead.data?.data?.totalTxs);
    const init = async () => {
      if (contractRead.data?.data?.totalTxs) return;
      transactionsPull.refetch();
    };

    init();
  }, [transactionsList?.data])

  // Render
  return (
    <main>
      <div className="p-8">
        <div className="mb-8">
          <Link to="/" className="button">
            Back
          </Link>
        </div>
        {/* {transactionsPull.isLoading || transactionsPull.isRefetching ? 'loading' : 'no loading'} */}
        <h1>SmartContractAR </h1>
        <h2>
          Contract <span className="text-zinc-500">{contractId}</span>
        </h2>
        <hr />
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
                <table className="mb-8">
                  <thead>
                    <tr>
                      <th>Contract ID</th>
                      <th>Owner Address</th>
                      <th>Network</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{contractRead.data?.data?.contractId}</td>
                      <td>{contractRead.data?.data?.ownerAddress}</td>
                      <td>{contractRead.data?.data?.network}</td>
                    </tr>
                  </tbody>
                </table>

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

                <h3>Transactions <span className="text-zinc-500">Total: {contractRead?.data?.data.totalTxs}</span></h3>

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
                            <code>{JSON.stringify(diff?.before, null, 2)}</code>
                          </pre>
                        </div>
                        <div className="w-1/2 overflow-scroll">
                          <h5>After</h5>
                          <pre>
                            <code>{JSON.stringify(diff?.after, null, 2)}</code>
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

        {/* {contractRead.isError && <p>Error: {JSON.stringify(contractRead?.error)}</p>} */}
      </div>
    </main>
  );
};

// Exports
// ========================================================
export default ContractPage;
