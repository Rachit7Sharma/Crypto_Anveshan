import React from 'react';
import 'css/Frontend.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain Wallet Dashboard</h1>
      </header>
      <main>
        {}
        <div className="wallet-balance">
          <h2>Wallet Balance</h2>
          {}
          <div className="balance-item">
            <span>Bitcoin (BTC):</span>
            <span>10.5 BTC</span>
          </div>
          <div className="balance-item">
            <span>Ethereum (ETH):</span>
            <span>100 ETH</span>
          </div>
          {}
        </div>

        {}
        <div className="transaction-history">
          <h2>Transaction History</h2>
          {}
          <ul>
            <li>Transaction 1 details...</li>
            <li>Transaction 2 details...</li>
            {}
          </ul>
        </div>

        {}
        <div className="transaction-form">
          <h2>Send Cryptocurrency</h2>
          {}
          <form>
            <div className="form-group">
              <label htmlFor="cryptoType">Select Cryptocurrency:</label>
              <select id="cryptoType">
                <option value="btc">Bitcoin (BTC)</option>
                <option value="eth">Ethereum (ETH)</option>
                {}
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

