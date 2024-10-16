// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [ruleString, setRuleString] = useState('');
  const [data, setData] = useState({ age: '', department: '', salary: '', experience: '',});
  const [result, setResult] = useState(null);
   const [ruleId,setruleid] = useState(null);
  const handleCreateRule = async () => {
    const response = await axios.post('http://localhost:5000/api/create_rule', { rule_string: ruleString });
    console.log('Rule Created:', response.data);
  };

  const handleEvaluateRule = async () => {
    console.log(ruleId);
    console.log(data);
    const response = await axios.post('http://localhost:5000/api/evaluate_rule', {
      ruleId, // Replace with the created rule ID
      data
    });
    setResult(response.data.result);
  };

  return (
    <div>
      <h1>Rule Engine</h1>
      <input
        type="text"
        placeholder="Enter Rule"
        value={ruleString}
        onChange={(e) => setRuleString(e.target.value)}
      />
      <button onClick={handleCreateRule}>Create Rule</button>

      <h2>Evaluate Rule</h2>
      <input
        type="text"
        placeholder="Rule_Id"
        onChange={(e) => setruleid(e.target.value)}
      />
      <input
        type="number"
        placeholder="Age"
        onChange={(e) => setData({ ...data, age: e.target.value })}
      />
      <input
        type="text"
        placeholder="Department"
        onChange={(e) => setData({ ...data, department: e.target.value })}
      />
      <input
        type="number"
        placeholder="Salary"
        onChange={(e) => setData({ ...data, salary: e.target.value })}
      />
      <input
        type="number"
        placeholder="Experience"
        onChange={(e) => setData({ ...data, experience: e.target.value })}
      />
      <button onClick={handleEvaluateRule}>Evaluate Rule</button>

      {result !== null && <h2>Result: {result.toString()}</h2>}
    </div>
  );
}

export default App;
