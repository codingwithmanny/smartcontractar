// Imports
// ========================================================
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import {
  IconLoader2,
  IconHistory,
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Prism from "prismjs";
// import "prismjs/components/prism-json";
import ReactDiffViewer from "react-diff-viewer";

// Main Render
// ========================================================
const ContractTransactions = () => {
  // State / Props
  const [isInitLoading, setIsInitLoading] = useState(true);
  const { contractId } = useParams<{ contractId: string }>();
  const [modal, setModal] = useState("");
  const [modalData, setModalData] = useState<any>();
  const [modalNav, setModalNav] = useState<any>({
    prev: undefined,
    next: undefined,
  });
  const [dropdown, setDropdown] = useState({
    inputs: false,
    errors: false,
  });

  // Requests
  /**
   *
   */
  const transactionsList = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contracts/${contractId}/transactions?order=timestamp&sort=asc`
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
  const isLoading = transactionsList?.isLoading;

  // Hooks
  useEffect(() => {
    if (isLoading) return;
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
   *
   */
  return (
    <>
      <main>
        <div className="px-8 pt-8 pb-24">
          <div className="w-full overflow-scroll">
            <table className="table w-full mb-6">
              <thead>
                <tr>
                  <th className="max-w-[160px]">Transaction ID</th>
                  <th className="max-w-[160px]">Block ID</th>
                  <th className="max-w-[160px]">Owner Address</th>
                  <th>Block Height</th>
                  <th>Timestamp</th>
                  <th>Details / History</th>
                </tr>
              </thead>
              <tbody>
                {transactionsList.data?.data?.map(
                  (transaction: any, key: number) => (
                    <tr key={`tx-${transaction.transactionId}`}>
                      <td>
                        <span
                          title={transaction.transactionId}
                          className="block font-mono text-sm text-zinc-700 text-ellipsis whitespace-nowrap overflow-hidden w-full max-w-xs"
                        >
                          {transaction.transactionId}
                        </span>
                      </td>
                      <td>
                        <span
                          title={transaction.blockId}
                          className="block font-mono text-sm text-zinc-700 text-ellipsis whitespace-nowrap overflow-hidden w-full max-w-xs"
                        >
                          {transaction.blockId}
                        </span>
                      </td>
                      <td>
                        <span
                          title={transaction.ownerAddress}
                          className="block font-mono text-sm text-zinc-700 text-ellipsis whitespace-nowrap overflow-hidden w-full max-w-xs"
                        >
                          {transaction.ownerAddress}
                        </span>
                      </td>
                      <td>
                        <span className="inline-block bg-zinc-100 font-mono text-sm text-zinc-500 py-[2px] px-1 rounded-lg border border-zinc-200">
                          {transaction.blockHeight}
                        </span>
                      </td>
                      <td>
                        <span className="inline-block bg-zinc-100 font-mono text-sm text-zinc-500 py-[2px] px-1 rounded-lg border border-zinc-200">
                          <time
                            title={new Date(
                              transaction.timestamp * 1000
                            ).toLocaleString()}
                            dateTime={transaction.timestamp}
                          >
                            {transaction.timestamp}
                          </time>
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setModalData(transaction);
                            setModal(transaction.transactionId);
                            setModalNav({
                              prev: transactionsList.data?.data?.[key - 1]
                                ? {
                                    ...transactionsList.data?.data?.[key - 1],
                                    index: key - 1,
                                  }
                                : undefined,
                              next: transactionsList.data?.data?.[key + 1]
                                ? {
                                    ...transactionsList.data?.data?.[key + 1],
                                    index: key + 1,
                                  }
                                : undefined,
                            });
                          }}
                          type="button"
                          className="group w-full inline-flex justify-center bg-white hover:bg-zinc-50 items-center border border-zinc-100 leading-8 px-3 rounded-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200"
                        >
                          <IconHistory
                            size={16}
                            className="mr-1 text-zinc-300"
                          />
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="group w-full justify-center bg-white hover:bg-zinc-50 inline-flex items-center border border-zinc-100 leading-[3rem] pl-4 pr-6 rounded-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200"
          >
            Load More
          </button>
        </div>
      </main>

      <Transition.Root show={Boolean(modal)} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setModal("")}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-5xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="block text-base font-bold leading-6 text-zinc-800">
                            Transaction
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setModal("")}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <p className="text-zinc-500 mb-4">
                          {modalData?.transactionId}
                        </p>
                        <div className="flex">
                          <button
                            disabled={!modalNav?.prev}
                            className={`disabled:opacity-50 disabled:bg-zinc-100 group w-full leading-[3rem] inline-flex justify-start bg-white hover:bg-zinc-50 items-center border-t border-b border-l border-zinc-100 px-3 rounded-tl-lg rounded-bl-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200`}
                            type="button"
                            onClick={() => {
                              setModalData(modalNav?.prev);
                              setModalNav({
                                prev: transactionsList.data?.data?.[
                                  modalNav?.prev?.index - 1
                                ]
                                  ? {
                                      ...transactionsList.data?.data?.[
                                        modalNav?.prev?.index - 1
                                      ],
                                      index: modalNav?.prev?.index - 1,
                                    }
                                  : undefined,
                                next: transactionsList.data?.data?.[
                                  modalNav?.prev?.index + 1
                                ]
                                  ? {
                                      ...transactionsList.data?.data?.[
                                        modalNav?.prev?.index + 1
                                      ],
                                      index: modalNav?.prev?.index + 1,
                                    }
                                  : undefined,
                              });
                            }}
                          >
                            <span className="mr-1">
                              <IconArrowLeft
                                size={16}
                                className="mr-1 text-zinc-300"
                              />
                            </span>
                            Prev Tx
                          </button>
                          <button
                            disabled={!modalNav?.next}
                            className={`disabled:opacity-50 disabled:bg-zinc-100 group w-full leading-[3rem] inline-flex justify-end bg-white hover:bg-zinc-50 items-center border border-zinc-100 px-3 rounded-tr-lg rounded-br-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200`}
                            type="button"
                            onClick={() => {
                              setModalData(modalNav?.next);
                              setModalNav({
                                prev: transactionsList.data?.data?.[
                                  modalNav?.next?.index - 1
                                ]
                                  ? {
                                      ...transactionsList.data?.data?.[
                                        modalNav?.next?.index - 1
                                      ],
                                      index: modalNav?.next?.index - 1,
                                    }
                                  : undefined,
                                next: transactionsList.data?.data?.[
                                  modalNav?.next?.index + 1
                                ]
                                  ? {
                                      ...transactionsList.data?.data?.[
                                        modalNav?.next?.index + 1
                                      ],
                                      index: modalNav?.next?.index + 1,
                                    }
                                  : undefined,
                              });
                            }}
                          >
                            Next Tx
                            <span className="ml-1">
                              <IconArrowRight
                                size={16}
                                className="ml-1 text-zinc-300"
                              />
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="mb-6">
                          <section className="border mb-4 border-zinc-100 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-colors ease-in-out duration-200">
                            <div className="group p-4 flex justify-between items-center cursor-pointer">
                              <h3 className="w-full font-medium text-zinc-700 text-sm flex justify-between">
                                <span className="mr-2">Owner</span>
                                <span className="text-zinc-400 font-mono">
                                  {modalData?.ownerAddress}
                                </span>
                              </h3>
                            </div>
                          </section>
                          <section className="border mb-4 border-zinc-100 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-colors ease-in-out duration-200">
                            <div
                              onClick={() => {
                                setDropdown((prev) => ({
                                  ...prev,
                                  inputs: !prev.inputs,
                                }));
                              }}
                              className="group p-4 flex justify-between items-center cursor-pointer"
                            >
                              <h3 className=" font-medium text-zinc-700 text-sm flex">
                                <span className="mr-2">Inputs</span>
                                <span className="text-zinc-400">/ Payload</span>
                              </h3>
                              {!dropdown.inputs ? (
                                <IconChevronDown
                                  size={16}
                                  className="text-zinc-400 group-hover:text-zinc-600 transition-colors ease-in-out duration-200"
                                />
                              ) : (
                                <IconChevronUp
                                  size={16}
                                  className="text-zinc-400 group-hover:text-zinc-600 transition-colors ease-in-out duration-200"
                                />
                              )}
                            </div>
                            <div
                              className={`p-4 border-t border-zinc-100 ${
                                !dropdown.inputs ? "hidden" : ""
                              }`}
                            >
                              <div className="diff-code">
                                <div className="diff">
                                  <ReactDiffViewer
                                    leftTitle={""}
                                    rightTitle={"Input"}
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
                                    newValue={JSON.stringify(
                                      modalData?.inputs,
                                      null,
                                      2
                                    )}
                                    renderContent={(str: string) => {
                                      if (!str) return <></>;
                                      return (
                                        <span
                                          style={{ display: "inline" }}
                                          dangerouslySetInnerHTML={{
                                            __html: Prism.highlight(
                                              str,
                                              Prism.languages.json,
                                              "json"
                                            ),
                                          }}
                                        />
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </section>

                          <section className="border border-zinc-100 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-colors ease-in-out duration-200">
                            <div
                              onClick={() => {
                                if (!modalData.error) return;
                                setDropdown((prev) => ({
                                  ...prev,
                                  errors: !prev?.errors,
                                }));
                              }}
                              className="group p-4 flex justify-between items-center cursor-pointer"
                            >
                              <h3 className="w-full pr-2 font-medium text-zinc-700 text-sm flex justify-between">
                                <span>Errors</span>
                                <span className="bg-zinc-400 py-1 px-2 rounded text-white text-xs font-mono">
                                  {modalData?.error ? "1" : "N/A"}
                                </span>
                              </h3>
                              {modalData?.error ? (
                                <>
                                  {!dropdown.errors ? (
                                    <IconChevronDown
                                      size={16}
                                      className="text-zinc-400 group-hover:text-zinc-600 transition-colors ease-in-out duration-200"
                                    />
                                  ) : (
                                    <IconChevronUp
                                      size={16}
                                      className="text-zinc-400 group-hover:text-zinc-600 transition-colors ease-in-out duration-200"
                                    />
                                  )}
                                </>
                              ) : null}
                            </div>
                            {modalData?.error ? (
                              <div
                                className={`p-4 border-t border-zinc-100 ${
                                  !dropdown?.errors ? "hidden" : ""
                                }`}
                              >
                                <div className="diff-code">
                                  <div className="diff">
                                <ReactDiffViewer
                                leftTitle={"Previous State"}
                                rightTitle={"Error"}
                                splitView={true}
                                oldValue={""}
                                newValue={modalData?.error}
                                styles={{
                                  diffAdded: {
                                    background: "none",
                                  },
                                  marker: {
                                    opacity: 0,
                                  },
                                }}
                                renderContent={(str: string) => {
                                  if (!str) return <></>;
                                  return (
                                    <span
                                      style={{ display: "inline" }}
                                      dangerouslySetInnerHTML={{
                                        __html: Prism.highlight(
                                          str,
                                          Prism.languages.json,
                                          "json"
                                        ),
                                      }}
                                    />
                                  );
                                }}
                              />
                              </div>
                              </div>
                              </div>
                            ) : null}
                          </section>
                        </div>

                        <div className="block w-full overflow-scroll">
                          <div id="diff" className="w-full">
                            <ReactDiffViewer
                              leftTitle={"Previous State"}
                              rightTitle={"Result State"}
                              splitView={true}
                              oldValue={JSON.stringify(
                                modalData?.before,
                                null,
                                2
                              )}
                              newValue={JSON.stringify(
                                modalData?.after,
                                null,
                                2
                              )}
                              renderContent={(str: string) => {
                                if (!str) return <></>;
                                return (
                                  <span
                                    style={{ display: "inline" }}
                                    dangerouslySetInnerHTML={{
                                      __html: Prism.highlight(
                                        str,
                                        Prism.languages.json,
                                        "json"
                                      ),
                                    }}
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

// Exports
// ========================================================
export default ContractTransactions;
