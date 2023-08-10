// Imports
// ========================================================
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IconLoader2 } from "@tabler/icons-react";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import ReactDiffViewer from "react-diff-viewer";

// Main Render
// ========================================================
const ContractState = () => {
  // State / Props
  const [isInitLoading, setIsInitLoading] = useState(true);
  const { contractId } = useParams<{ contractId: string }>();

  // Requests
  /**
   *
   */
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

  /**
   * Get latest transaction
   */
  const transactionsList = useQuery({
    queryKey: ["currentState"],
    queryFn: async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contracts/${contractId}/transactions?order=createdAt&sort=desc&limit=1`
      );
      if (!response.ok) {
        throw new Error("Network error.");
      }
      const json = await response.json();
      return json;
    },
  });

  /**
   *
   */
  const isLoading = contractRead.isLoading || transactionsList.isLoading;

  // Hooks
  useEffect(() => {
    if (
      contractRead?.isLoading ||
      !contractRead?.data ||
      !transactionsList.data
    )
      return;
    setIsInitLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Renders
  /**
   * Loading
   */
  if (isInitLoading) {
    return (
      <main className="w-full bg-zinc-50/50 h-[70vh]">
        <div className="p-8 flex justify-center">
          <div className="mt-24 bg-white shadow-sm p-8 inline-flex justify-center items-center rounded-lg">
            <IconLoader2 className=" text-zinc-500 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  /**
   * UI
   */
  return (
    <main>
      <div className="px-8 pt-8 pb-24">
        <header className="flex justify-between mb-8">
          <h2 className=" font-semibold">Contract State</h2>
        </header>
        <div id="diff">
          <ReactDiffViewer
            leftTitle={"Initial State"}
            rightTitle={"Current State"}
            splitView={true}
            oldValue={JSON.stringify(
              contractRead.data?.data?.initState,
              null,
              2
            )}
            newValue={JSON.stringify(
              transactionsList.data?.data[0]?.after,
              null,
              2
            )}
            renderContent={(str: string) => {
              if (!str) return <></>;
              return (
                <span
                  style={{ display: "inline" }}
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(str, Prism.languages.json, "json"),
                  }}
                />
              );
            }}
          />
        </div>
      </div>
    </main>
  );
};

// Exports
// ========================================================
export default ContractState;
