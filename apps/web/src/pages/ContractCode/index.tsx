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
const ContractCode = () => {
  // State / Props
  const [isInitLoading, setIsInitLoading] = useState(true);
  const { contractId } = useParams<{ contractId: string }>();
  console.log({ contractId });

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
      // try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contracts/${contractId}/transactions?order=timestamp&sort=desc&limit=1`
      );
      if (!response.ok) {
        throw new Error("Network error.");
      }
      const json = await response.json();
      return json;
    },
    // enabled: contractRead.data?.data?.contractId ? true : false,
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
          <h2 className=" font-semibold">Contract Source Code</h2>
        </header>
        <div id="diff-code">
          <div id="diff">
            <ReactDiffViewer
              leftTitle={"Initial State"}
              rightTitle={"Contract Code"}
              splitView={true}
              oldValue={""}
              styles={{
                diffAdded: {
                  background: "none",
                },
                marker: {
                  opacity: 0,
                },
              }}
              newValue={contractRead.data?.data?.sourceCode}
              renderContent={(str: string) => {
                if (!str) return <></>;
                return (
                  <span
                    style={{ display: "inline" }}
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        str,
                        Prism.languages.javascript,
                        "javascript"
                      ),
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

// Exports
// ========================================================
export default ContractCode;
