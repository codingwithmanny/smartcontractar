// Imports
// ========================================================
import { useMutation, useQuery } from "@tanstack/react-query";
import { IconLoader2, IconBell } from "@tabler/icons-react";
import { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import { IconX } from "@tabler/icons-react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Select from "../../components/Select";

// Main Render
// ========================================================
const ContractNotifications = () => {
  // State / Props
  const [modal, setModal] = useState("");
  const [modalData, setModalData] = useState<any>();
  const [inputsNotification, setInputsNotification] = useState<any>({
    object: [],
    operator: "",
    value: {
      type: undefined,
      value: undefined,
    },
    contact: "",
  });
  const [keySelections, setKeySelections] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] = useState<any>();
  const [isInitLoading, setIsInitLoading] = useState(true);
  const { contractId } = useParams<{ contractId: string }>();

  // Requests
  /**
   * Get all notifications
   */
  const notificationsList = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      // try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contracts/${contractId}/notifications`
      );
      if (!response.ok) {
        throw new Error("Network error.");
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
  const notificationsCreate = useMutation(
    async (payload: any) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contracts/${contractId}/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error("Network error.");
      }
      const json = await response.json();
      return json;
    },
    {
      onSuccess: () => {
        setModal("");
        notificationsList.refetch();
      },
    }
  );

  /**
   *
   */
  const notificationsDelete = useMutation(
    async (id: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network error.");
      }
      const json = await response.json();
      return json;
    },
    {
      onSuccess: () => {
        notificationsList.refetch();
      },
    }
  );

  /**
   *
   */
  const isLoading = notificationsList.isLoading || transactionsList.isLoading;

  /**
   *
   */
  const isMutationLoading =
    notificationsCreate.isLoading || notificationsDelete.isLoading;

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
   * UI
   */
  return (
    <>
      <main>
        <div className="px-8 pt-8 pb-24">
          <header className="flex justify-between items-center mb-8">
            <h2 className=" font-semibold">All Notifications</h2>

            <button
              onClick={() => {
                setModal("create");
                setModalData(transactionsList?.data?.data[0]?.after);
                setKeySelections(
                  Object.keys(transactionsList?.data?.data[0]?.after)
                );
                setSelectedObject(transactionsList?.data?.data[0]?.after);
                setInputsNotification({
                  object: [],
                  operator: "",
                  value: {
                    type: undefined,
                    value: undefined,
                  },
                  contact: "",
                });
              }}
              type="button"
              className="group bg-white hover:bg-zinc-50 inline-flex items-center border border-zinc-100 leading-[3rem] pl-4 pr-6 rounded-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200"
            >
              <IconBell
                size={16}
                className="text-zinc-300 mr-2 transform transition-all ease-in-out duration-200"
              />
              Create Notification
            </button>
          </header>

          <div className="bg-amber-100 border border-amber-300 text-amber-700 rounded-lg p-4 mb-8">
            <span className="text-amber-800 font-semibold mr-1">NOTE!</span>
            Make sure to delete the notification when done. All emails are still
            stored in the database until deleted.
          </div>

          <div className="w-full overflow-scroll">
            <table className="table w-full mb-6">
              <thead>
                <tr>
                  <th className="max-w-[160px]">Status</th>
                  <th className="max-w-[160px]">ID</th>
                  <th className="max-w-[160px]">Email</th>
                  <th>Last Checked</th>
                  <th>Successful Attempts</th>
                  <th>Failed Attempts</th>
                  <th>Created</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {notificationsList.data?.data?.map((notification: any) => (
                  <tr key={`notifications-${notification.id}`}>
                    <td>
                      <span
                        title={notification.status}
                        className={`${
                          notification.status === "COMPLETED"
                            ? "bg-green-100 text-green-600 border-green-200"
                            : ""
                        } ${
                          notification.status === "PENDING"
                            ? "bg-zinc-100 text-zinc-500 border-zinc-200"
                            : ""
                        } ${
                          notification.status === "RUNNING"
                            ? "bg-blue-100 text-blue-500 border-blue-200"
                            : ""
                        } ${
                          notification.status === "CANCELLED"
                            ? "bg-red-100 text-red-500 border-red-200"
                            : ""
                        } inline-block  font-mono text-xs  py-[2px] px-1 rounded-lg border `}
                      >
                        {notification.status}
                      </span>
                    </td>
                    <td>
                      <span
                        title={notification.id}
                        className="block font-mono text-sm text-zinc-700 text-ellipsis whitespace-nowrap overflow-hidden w-full max-w-xs"
                      >
                        {notification.id}
                      </span>
                    </td>
                    <td>
                      <span
                        title={notification.email}
                        className="block font-mono text-sm text-zinc-700 text-ellipsis whitespace-nowrap overflow-hidden w-full max-w-xs"
                      >
                        {notification.email}
                      </span>
                    </td>
                    <td>
                      <span className="inline-block bg-zinc-100 font-mono text-sm text-zinc-500 py-[2px] px-1 rounded-lg border border-zinc-200">
                        {notification.lastCheckedAt ? notification.lastCheckedAt : "Never"}
                      </span>
                    </td>
                    <td>
                      <span className="inline-block bg-zinc-100 font-mono text-sm text-zinc-500 py-[2px] px-1 rounded-lg border border-zinc-200">
                        {notification.successfulAttempts}
                      </span>
                    </td>
                    <td>
                      <span className="inline-block bg-zinc-100 font-mono text-sm text-zinc-500 py-[2px] px-1 rounded-lg border border-zinc-200">
                        {notification.failedAttempts}
                      </span>
                    </td>
                    <td>
                      <span className="inline-block bg-zinc-100 font-mono text-sm text-zinc-500 py-[2px] px-1 rounded-lg border border-zinc-200">
                        {notification.createdAt}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          notificationsDelete.mutate(notification.id);
                        }}
                        type="button"
                        className="group w-full inline-flex justify-center bg-white hover:bg-zinc-50 items-center border border-zinc-100 leading-8 px-3 rounded-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
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
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white pt-6 pb-32 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="block text-base font-bold leading-6 text-zinc-800">
                            New Notification
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => {
                                setInputsNotification({
                                  object: [],
                                  operator: "",
                                  value: {
                                    type: undefined,
                                    value: undefined,
                                  },
                                  contact: "",
                                });
                                setModal("");
                              }}
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
                          Start by choosing the object key value you'd like to
                          track.
                        </p>
                        <div className="bg-amber-100 border border-amber-300 text-amber-700 rounded-lg p-4">
                          <span className="text-amber-800 font-semibold mr-1">
                            NOTE!
                          </span>
                          API requests are limitted to 10 requests before the
                          cron stops.
                        </div>
                      </div>

                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <label className="flex mb-4 font-semibold text-zinc-600">
                          <span className="text-white mr-2 bg-indigo-600 font-mono font-normal w-6 h-6 flex justify-center items-center rounded">
                            1
                          </span>
                          Object
                        </label>
                        <ul>
                          {inputsNotification.object.map(
                            (keyName: any, key: number) => (
                              <li key={`key-${key}`}>
                                <div className="border border-zinc-300 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-colors ease-in-out duration-200">
                                  <div className="group p-4 flex justify-between items-center">
                                    <h3 className="w-full font-medium text-zinc-700 text-sm flex items-center justify-between">
                                      <span className="text-zinc-500 font-mono">
                                        {keyName}
                                      </span>
                                      <button
                                        onClick={() => {
                                          console.log({ index: key });
                                          console.log({ inputsNotification });
                                          const newInputsNotificationObject = [
                                            ...inputsNotification.object,
                                          ].slice(
                                            -inputsNotification.object.length,
                                            key
                                          );
                                          setInputsNotification(
                                            (prev: any) => ({
                                              ...prev,
                                              object:
                                                newInputsNotificationObject,
                                            })
                                          );
                                          console.log({
                                            newInputsNotificationObject,
                                          });
                                          const newSelectedObject = {
                                            ...modalData,
                                          };
                                          console.log({ newSelectedObject });

                                          if (
                                            newInputsNotificationObject.length ===
                                            0
                                          ) {
                                            setKeySelections(
                                              Object.keys(modalData)
                                            );
                                            setSelectedObject(modalData);
                                          } else {
                                            const results =
                                              newInputsNotificationObject.reduce(
                                                (acc: any, curr: any) => {
                                                  console.log({ acc, curr });
                                                  return acc[curr];
                                                },
                                                newSelectedObject
                                              );
                                            console.log({ results });
                                            setKeySelections(
                                              Object.keys(results)
                                            );
                                            setSelectedObject(results);
                                          }
                                        }}
                                        className="group p-1 rounded hover:bg-zinc-100"
                                      >
                                        <IconX
                                          size={16}
                                          className="text-zinc-500"
                                        />
                                      </button>
                                    </h3>
                                  </div>
                                </div>
                                {inputsNotification.object.length - 1 !==
                                key ? (
                                  <span className="w-[2px] h-4 ml-4 bg-zinc-100 block"></span>
                                ) : null}
                              </li>
                            )
                          )}
                        </ul>
                        {keySelections?.length > 0 ? (
                          <>
                            {inputsNotification.object.length > 0 ? (
                              <span className="w-[2px] h-4 ml-4 bg-zinc-100 block"></span>
                            ) : null}
                            <div className="border border-zinc-200 rounded-lg p-5 bg-zinc-50">
                              <Select
                                allowSelected={false}
                                label="Object Key"
                                defaultSelected={{
                                  id: "",
                                  name: "Select a key",
                                }}
                                onChange={(data: any) => {
                                  console.log({ data });
                                  setInputsNotification((prev: any) => ({
                                    ...prev,
                                    object: [...prev.object, data.id],
                                  }));
                                  if (
                                    selectedObject?.[data?.id] &&
                                    Object.keys(selectedObject?.[data?.id])
                                      .length > 0
                                  ) {
                                    console.log("true");
                                    console.log(selectedObject?.[data?.id]);
                                    if (
                                      typeof selectedObject?.[data?.id] ===
                                        "object" &&
                                      selectedObject?.[data?.id] !== null
                                    ) {
                                      setKeySelections(
                                        Object.keys(selectedObject?.[data?.id])
                                      );
                                      setSelectedObject(
                                        selectedObject?.[data?.id]
                                      );
                                    } else {
                                      setKeySelections([]);
                                    }
                                  }
                                }}
                                options={
                                  keySelections.map((key) => ({
                                    id: key,
                                    name: key,
                                  })) || []
                                }
                              />
                            </div>
                          </>
                        ) : null}

                        <div className="mt-8">
                          <label className="flex mb-4 font-semibold text-zinc-600">
                            <span className="text-white mr-2 bg-indigo-600 font-mono font-normal w-6 h-6 flex justify-center items-center rounded">
                              2
                            </span>
                            Condition
                          </label>
                        </div>

                        <ul>
                          {inputsNotification?.operator ? (
                            <li>
                              <div className="border border-zinc-300 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-colors ease-in-out duration-200">
                                <div className="group p-4 flex justify-between items-center">
                                  <h3 className="w-full font-medium text-zinc-700 text-sm flex items-center justify-between">
                                    <span className="text-zinc-500 font-mono">
                                      {inputsNotification?.operator}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setInputsNotification((prev: any) => ({
                                          ...prev,
                                          operator: "",
                                        }));
                                      }}
                                      className="group p-1 rounded hover:bg-zinc-100"
                                    >
                                      <IconX
                                        size={16}
                                        className="text-zinc-500"
                                      />
                                    </button>
                                  </h3>
                                </div>
                              </div>
                            </li>
                          ) : null}
                        </ul>

                        {!inputsNotification.operator ? (
                          <div className="border border-zinc-200 rounded-lg p-5 bg-zinc-50">
                            <Select
                              allowSelected={false}
                              label="Operator"
                              defaultSelected={{
                                id: "",
                                name: "Select an operator",
                              }}
                              onChange={(data: any) => {
                                setInputsNotification((prev: any) => ({
                                  ...prev,
                                  operator: data.id,
                                }));
                              }}
                              options={[
                                {
                                  id: "==",
                                  name: "==",
                                },
                                {
                                  id: "!=",
                                  name: "!=",
                                },
                                {
                                  id: "===",
                                  name: "===",
                                },
                                {
                                  id: "!==",
                                  name: "!==",
                                },
                                {
                                  id: ">",
                                  name: ">",
                                },
                                {
                                  id: ">=",
                                  name: ">=",
                                },
                                {
                                  id: "<",
                                  name: "<",
                                },
                                {
                                  id: "<=",
                                  name: "<=",
                                },
                              ]}
                            />
                          </div>
                        ) : null}
                        <div className="mt-8">
                          <label className="flex mb-4 font-semibold text-zinc-600">
                            <span className="text-white mr-2 bg-indigo-600 font-mono font-normal w-6 h-6 flex justify-center items-center rounded">
                              3
                            </span>
                            Value
                          </label>

                          <ul>
                            {inputsNotification?.value?.type ? (
                              <li>
                                <div className="border border-zinc-300 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-colors ease-in-out duration-200">
                                  <div className="group p-4 flex justify-between items-center">
                                    <h3 className="w-full font-medium text-zinc-700 text-sm flex items-center justify-between">
                                      <span className="text-zinc-500 font-mono">
                                        {inputsNotification?.value?.type}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setInputsNotification(
                                            (prev: any) => ({
                                              ...prev,
                                              value: {
                                                type: undefined,
                                                value: undefined,
                                              },
                                            })
                                          );
                                        }}
                                        className="group p-1 rounded hover:bg-zinc-100"
                                      >
                                        <IconX
                                          size={16}
                                          className="text-zinc-500"
                                        />
                                      </button>
                                    </h3>
                                  </div>
                                </div>
                              </li>
                            ) : null}
                          </ul>

                          {!inputsNotification?.value?.type ? (
                            <div className="border border-zinc-200 rounded-lg p-5 bg-zinc-50">
                              <Select
                                label="Value Type"
                                allowSelected={false}
                                onChange={(data: any) => {
                                  setInputsNotification((prev: any) => ({
                                    ...prev,
                                    value: {
                                      type: data.id,
                                      value:
                                        data.id === "boolean"
                                          ? true
                                          : data.id === "number"
                                          ? 0
                                          : data.id === "string"
                                          ? ""
                                          : undefined,
                                    },
                                  }));
                                }}
                                defaultSelected={{
                                  id: "",
                                  name: "Select a type",
                                }}
                                options={[
                                  {
                                    id: "string",
                                    name: "string",
                                  },
                                  {
                                    id: "number",
                                    name: "number",
                                  },
                                  {
                                    id: "boolean",
                                    name: "boolean",
                                  },
                                  {
                                    id: "null",
                                    name: "null",
                                  },
                                  {
                                    id: "undefined",
                                    name: "undefined",
                                  },
                                ]}
                              />
                            </div>
                          ) : (
                            <div>
                              {["string", "number", "boolean"].includes(
                                inputsNotification?.value?.type
                              ) ? (
                                <span className="w-[2px] h-4 ml-4 bg-zinc-100 block"></span>
                              ) : null}

                              {inputsNotification?.value?.type === "string" ? (
                                <div>
                                  <label
                                    htmlFor="string"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                  >
                                    String
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      value={inputsNotification?.value?.value}
                                      onChange={(e) => {
                                        setInputsNotification((prev: any) => ({
                                          ...prev,
                                          value: {
                                            ...prev.value,
                                            value: e.target.value,
                                          },
                                        }));
                                      }}
                                      type="text"
                                      name="string"
                                      id="string"
                                      className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                      placeholder="Enter a string (leave blank if empty string)"
                                    />
                                  </div>
                                </div>
                              ) : null}

                              {inputsNotification?.value?.type === "number" ? (
                                <div>
                                  <label
                                    htmlFor="number"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                  >
                                    Number
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      value={inputsNotification?.value?.value}
                                      onChange={(e) => {
                                        setInputsNotification((prev: any) => ({
                                          ...prev,
                                          value: {
                                            ...prev.value,
                                            value: e.target.value,
                                          },
                                        }));
                                      }}
                                      type="number"
                                      name="number"
                                      id="number"
                                      className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                      placeholder="Enter an number"
                                    />
                                  </div>
                                </div>
                              ) : null}

                              {inputsNotification?.value?.type === "boolean" ? (
                                <div>
                                  <div className="mt-2">
                                    <Select
                                      label="Boolean"
                                      onChange={(data: any) => {
                                        setInputsNotification((prev: any) => ({
                                          ...prev,
                                          value: {
                                            ...prev.value,
                                            value:
                                              data.id === "true" ? true : false,
                                          },
                                        }));
                                      }}
                                      defaultSelected={{
                                        id: "true",
                                        name: "true",
                                      }}
                                      options={[
                                        {
                                          id: "true",
                                          name: "true",
                                        },
                                        {
                                          id: "false",
                                          name: "false",
                                        },
                                      ]}
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div className="mt-8">
                          <label className="flex mb-4 font-semibold text-zinc-600">
                            <span className="text-white mr-2 bg-indigo-600 font-mono font-normal w-6 h-6 flex justify-center items-center rounded">
                              4
                            </span>
                            Contact
                          </label>

                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Email
                            </label>
                            <div className="mt-2">
                              <input
                                onChange={(e) => {
                                  setInputsNotification((prev: any) => ({
                                    ...prev,
                                    contact: e.target.value,
                                  }));
                                }}
                                value={inputsNotification?.contact}
                                type="email"
                                name="email"
                                id="email"
                                className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="you@example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-zinc-50 border-t border-zinc-100 w-full flex justify-end fixed bottom-0 px-6 py-4">
                        <button
                          onClick={() => {
                            notificationsCreate.mutate({
                              object: inputsNotification.object
                                .map((key: any, index: number) =>
                                  index === 0 ? key : `["${key}"]`
                                )
                                .join("?."),
                              operator: inputsNotification.operator,
                              valueType: inputsNotification.value.type,
                              value: inputsNotification.value.value,
                              email: inputsNotification.contact,
                              // Defaults
                              cron: "* * * * *", // Overriden in API
                              expirationType: "intervals", // Overriden in API
                              expirationValue: "10", // Overriden in API - 10 cronjob requests before stopping
                              retries: 3, // Overriden in API
                            });
                          }}
                          disabled={
                            isLoading ||
                            isMutationLoading ||
                            !(
                              inputsNotification.object.length > 0 &&
                              inputsNotification.operator &&
                              inputsNotification.value?.type &&
                              inputsNotification.contact &&
                              inputsNotification.contact.match(
                                /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
                              )
                            )
                          }
                          type="button"
                          className="disabled:opacity-50 disabled:bg-zinc-100 group bg-white hover:bg-zinc-50 inline-flex items-center border border-zinc-200 leading-[2.75rem] px-6 rounded-lg text-zinc-800 font-medium text-sm transition-colors ease-in-out duration-200"
                        >
                          Save
                        </button>
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
export default ContractNotifications;
