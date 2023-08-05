// Imports
// ========================================================
import { useNavigate } from "react-router-dom";

// Main Render
// ========================================================
const HomePage = () => {
  // State / Props
  const navigate = useNavigate();

  // Render
  return (
    <main>
      <div className="p-8">
        <h1>SmartContractAR</h1>
        <p>See the history of a contract with all its state changes.</p>
        <hr />
        <form onSubmit={(event) => {
          event.preventDefault();
          navigate(`/contract/${event.currentTarget.contractId.value}`);
        }}>
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
};

// Exports
// ========================================================
export default HomePage;
