import React from 'react';
import 'css/Frontend.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain Wallet Dashboard</h1>
      </header>
      <main>
        {/* Wallet balance component */}
        <div className="wallet-balance">
          <h2>Wallet Balance</h2>
          {/* Display balance for each cryptocurrency */}
          <div className="balance-item">
            <span>Bitcoin (BTC):</span>
            <span>10.5 BTC</span>
          </div>
          <div className="balance-item">
            <span>Ethereum (ETH):</span>
            <span>100 ETH</span>
          </div>
          {/* Add more cryptocurrency balances as needed */}
        </div>

        {/* Transaction history component */}
        <div className="transaction-history">
          <h2>Transaction History</h2>
          {/* Display recent transactions */}
          <ul>
            <li>Transaction 1 details...</li>
            <li>Transaction 2 details...</li>
            {/* Add more transaction items as needed */}
          </ul>
        </div>

        {/* Transaction form component */}
        <div className="transaction-form">
          <h2>Send Cryptocurrency</h2>
          {/* Form to send cryptocurrency */}
          <form>
            <div className="form-group">
              <label htmlFor="cryptoType">Select Cryptocurrency:</label>
              <select id="cryptoType">
                <option value="btc">Bitcoin (BTC)</option>
                <option value="eth">Ethereum (ETH)</option>
                {/* Add more cryptocurrency options as needed */}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input type="text" id="amount" />
            </div>
            <div className="form-group">
              <label htmlFor="recipient">Recipient Address:</label>
              <input type="text" id="recipient" />
            </div>
            <button type="submit">Send</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;

