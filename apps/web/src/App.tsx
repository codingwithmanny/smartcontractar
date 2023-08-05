// Imports
// ========================================================
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { TODOS, USERS } from "./queries";
// import { useRef, useState } from "react";
// import { readContractState } from "arweavekit/contract";

// Main Component
// ========================================================
const App = () => {
  return (
    <main>
      <div className="p-8">
        <h1>SmartContractAr</h1>

        <p>See the history of a contract with all its state changes.</p>

        <hr />

        <form>
          <div className="mb-4">
            <label htmlFor="contractId">Contract ID</label>
            <input
              required
              type="text"
              name="contractId"
              id="contractId"
              placeholder="Contract ID"
            />
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </main>
  );

  // // State / Props
  // const formUserCreateRef = useRef<HTMLFormElement>(null);
  // const [userReadId, setUserReadId] = useState<string>("");

  // // Requests
  // /**
  //  * Users LIST
  //  */
  // const usersList = useQuery({ queryKey: ["users"], queryFn: USERS.list });

  // /**
  //  * Users CREATE
  //  */
  // const usersCreate = useMutation(USERS.create, {
  //   onSuccess: () => {
  //     usersList.refetch();
  //   },
  // });

  // /**
  //  * Users READ
  //  */
  // const usersRead = useQuery({
  //   queryKey: ["users", userReadId],
  //   queryFn: () => USERS.read(userReadId as string),
  //   enabled: !!userReadId,
  // });

  // /**
  //  * Users UPDATE
  //  */
  // const usersUpdate = useMutation(USERS.update, {
  //   onSuccess: () => {
  //     usersList.refetch();
  //   },
  // });

  // /**
  //  * Users DELETE
  //  */
  // const usersDelete = useMutation(USERS.delete, {
  //   onSuccess: () => {
  //     usersList.refetch();
  //   },
  // });

  // /**
  //  * Todos LIST
  //  */
  // const todosList = useQuery({ queryKey: ["todos"], queryFn: TODOS.list });

  // /**
  //  *
  //  */
  // const isLoading =
  //   usersList.isLoading ||
  //   usersList.isRefetching ||
  //   usersCreate.isLoading ||
  //   usersUpdate.isLoading ||
  //   usersDelete.isLoading;

  // // Return
  // return (
  //   <>
  //     <main className="p-8">
  //       <h1>Sample API NextJS Serverless + ViteJS</h1>
  //       <p>Description here.</p>

  //       <hr />

  //       <h2>
  //         Users <span className="text-zinc-400">List</span>
  //       </h2>

  //       <table className="mb-8">
  //         <thead>
  //           <tr>
  //             <th>ID</th>
  //             <th>Email</th>
  //             <th>Created</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {usersList.data?.data.map((user: any, key: number) => (
  //             <tr key={`user-${key}`}>
  //               <td>{user.id}</td>
  //               <td>{user.email}</td>
  //               <td>{user.createdAt}</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>

  //       <h2>
  //         Users <span className="text-zinc-400">Create</span>
  //       </h2>

  //       <form
  //         className="mb-8"
  //         ref={formUserCreateRef}
  //         onSubmit={async (event) => {
  //           event.preventDefault();
  //           try {
  //             await usersCreate.mutateAsync({
  //               email: event.currentTarget.email.value,
  //             });
  //             if (formUserCreateRef.current) {
  //               formUserCreateRef.current.reset();
  //             }
  //           } catch (error) {
  //             console.log({ error });
  //           }
  //         }}
  //       >
  //         <div className="mb-4">
  //           <label htmlFor="email">Email</label>
  //           <input
  //             disabled={isLoading}
  //             required
  //             type="email"
  //             name="email"
  //             id="email"
  //             placeholder="email@example.com"
  //           />
  //         </div>
  //         <div>
  //           <button disabled={isLoading} type="submit">
  //             Submit
  //           </button>
  //         </div>
  //       </form>

  //       <h2>
  //         Users <span className="text-zinc-400">Read</span>
  //       </h2>

  //       <form
  //         className="mb-8"
  //         ref={formUserCreateRef}
  //         onSubmit={async (event) => {
  //           event.preventDefault();
  //           setUserReadId(event.currentTarget.userId.value);
  //         }}
  //       >
  //         <div className="mb-4">
  //           <label htmlFor="userId">ID</label>
  //           <input
  //             disabled={isLoading}
  //             required
  //             type="text"
  //             name="userId"
  //             id="userId"
  //             placeholder="14ffb167-1113-45cc-98c1-bc50b7b95318"
  //           />
  //         </div>
  //         <div>
  //           <button disabled={isLoading} type="submit">
  //             Submit
  //           </button>
  //         </div>
  //       </form>

  //       {usersRead.data ? (
  //         <pre className="mb-8">
  //           <code>{JSON.stringify(usersRead.data, null, 2)}</code>
  //         </pre>
  //       ) : null}

  //       <h2>
  //         Users <span className="text-zinc-400">Update</span>
  //       </h2>

  //       <form
  //         className="mb-8"
  //         ref={formUserCreateRef}
  //         onSubmit={async (event) => {
  //           event.preventDefault();
  //           try {
  //             await usersUpdate.mutateAsync({
  //               userId: event.currentTarget.userId.value,
  //               email: event.currentTarget.email.value,
  //             });
  //           } catch (error) {
  //             console.log({ error });
  //           }
  //         }}
  //       >
  //         <div className="mb-4">
  //           <label htmlFor="userId">ID</label>
  //           <input
  //             disabled={isLoading}
  //             required
  //             type="text"
  //             name="userId"
  //             id="userId"
  //             placeholder="14ffb167-1113-45cc-98c1-bc50b7b95318"
  //           />
  //         </div>
  //         <div className="mb-4">
  //           <label htmlFor="email">Email</label>
  //           <input
  //             disabled={isLoading}
  //             required
  //             type="email"
  //             name="email"
  //             id="email"
  //             placeholder="email@example.com"
  //           />
  //         </div>
  //         <div>
  //           <button disabled={isLoading} type="submit">
  //             Submit
  //           </button>
  //         </div>
  //       </form>

  //       {usersUpdate.data ? (
  //         <pre className="mb-8">
  //           <code>{JSON.stringify(usersUpdate.data, null, 2)}</code>
  //         </pre>
  //       ) : null}

  //       <h2>
  //         Users <span className="text-zinc-400">Delete</span>
  //       </h2>

  //       <form
  //         className="mb-8"
  //         ref={formUserCreateRef}
  //         onSubmit={async (event) => {
  //           event.preventDefault();
  //           try {
  //             const readResult = await readContractState({
  //               environment: "mainnet",
  //               // contractTxId: "12l44J1L6R88VQovPPN82ImrRsQxAoUxZNUMumpQjiU",
  //               contractTxId: "789i3rhsiqxE_SziYqYl6mCLIyrRsvTXKgfTunZbOhc"
  //             });

  //             console.log({ readResult})
  //           } catch (error) {
  //             console.error({ error });
  //           }
  //           // try {
  //           //   await usersDelete.mutateAsync(event.currentTarget.userId.value);
  //           // } catch (error) {
  //           //   console.log({ error });
  //           // }
  //         }}
  //       >
  //         <div className="mb-4">
  //           <label htmlFor="userId">ID</label>
  //           <input
  //             disabled={isLoading}
  //             required
  //             type="text"
  //             name="userId"
  //             id="userId"
  //             placeholder="14ffb167-1113-45cc-98c1-bc50b7b95318"
  //           />
  //         </div>
  //         <div>
  //           <button disabled={isLoading} type="submit">
  //             Submit
  //           </button>
  //         </div>
  //       </form>

  //       {usersDelete.data ? (
  //         <pre className="mb-8">
  //           <code>{JSON.stringify(usersDelete.data, null, 2)}</code>
  //         </pre>
  //       ) : null}

  //       <hr />

  //       <h2>
  //         Todos <span className="text-zinc-400">List</span>
  //       </h2>

  //       <table className="mb-8">
  //         <thead>
  //           <tr>
  //             <th>ID</th>
  //             <th>Todo</th>
  //             <th>Completion</th>
  //             <th>Created</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {todosList.data?.data.map((todo: any, key: number) => (
  //             <tr key={`todo-${key}`}>
  //               <td>{todo.id}</td>
  //               <td>{todo.todo}</td>
  //               <td>{todo.isComplete ? "COMPLETE" : "INCOMPLETE"}</td>
  //               <td>{todo.createdAt}</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </main>
  //   </>
  // );
};

// Exports
// ========================================================
export default App;
