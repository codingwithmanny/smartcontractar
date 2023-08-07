// Imports
// ========================================================
import { useNavigate } from "react-router-dom";
// import { useState } from 'react'
// import { Dialog } from '@headlessui/react'
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { IconSearch } from '@tabler/icons-react';

// Main Render
// ========================================================
const HomePage = () => {
  // State / Props
  const navigate = useNavigate();
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return <>
    <main className="flex items-center justify-center h-screen">
      <div className="w-full max-w-2xl px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl text-center mb-5">SmartContractAR</h1>
        <p className="text-zinc-500 text-center mb-8 text-lg">Get contract history and notifications.</p>
        <form onSubmit={(event) => {
          event.preventDefault();
          navigate(`/contract/${event.currentTarget.search.value}`);
        }}>
          <div className="relative">
            <input className="border border-zinc-200 leading-[3rem] rounded-lg pl-12 pr-4 w-full shadow-sm" name="search" type="text" placeholder="Contact Address (Ex: yZUcvwOin4FspimDAbkncgi5XL-Cu8_gmkSBeLSLT8E)" />
            <IconSearch size={20} className="text-zinc-300 absolute top-0 bottom-0 left-4 my-auto " />
          </div>
        </form>
      </div>
    </main>
  </>

  // // Render
  // return (
  //   <main>
  //     <div className="p-8">
  //       <h1>SmartContractAR</h1>
  //       <p>See the history of a contract with all its state changes.</p>
  //       <hr />
  //       <form onSubmit={(event) => {
  //         event.preventDefault();
  //         navigate(`/contract/${event.currentTarget.contractId.value}`);
  //       }}>
  //         <div className="mb-4">
  //           <label htmlFor="contractId">Contract ID</label>
  //           <input
  //             required
  //             type="text"
  //             name="contractId"
  //             id="contractId"
  //             placeholder="Contract ID"
  //           />
  //         </div>
  //         <div>
  //           <button type="submit">Submit</button>
  //         </div>
  //       </form>
  //     </div>
  //   </main>
  // );
};

// Exports
// ========================================================
export default HomePage;
