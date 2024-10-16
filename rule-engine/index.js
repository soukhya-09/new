// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Rule = require('./models/rule');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/rule_engine').then(()=>{
    console.log("connected successfully");
}).catch((error)=>{
    console.log(error);
});

// API to create a rule
// Helper function to remove circular references
function removeCircularReferences(node, seenNodes = new Set()) {
    if (node && typeof node === 'object') {
      if (seenNodes.has(node)) {
        return null; // Break circular reference by returning null or other placeholder
      }
      seenNodes.add(node);
  
      // Recursively apply the function to child nodes
      return {
        type: node.type,
        value: node.value,
        left: removeCircularReferences(node.left, seenNodes),
        right: removeCircularReferences(node.right, seenNodes)
      };
    }
    return node;
  }
  
  // Updated POST route
  app.post('/api/create_rule', async (req, res) => {
    const { rule_string, ruleName = 'Sample Rule' } = req.body;
    const ast = create_rule(rule_string);
    const sanitizedAst = removeCircularReferences(ast);
  
    // Ensure no circular references exist in sanitizedAst before saving
    const rule = new Rule({ ruleName, ast: sanitizedAst });
    
    try {
      await rule.save();
      res.json(rule);
    } catch (error) {
      console.error("Error saving rule:", error);
      res.status(400).json({ error: error.message });
    }
  });
  


app.post('/api/evaluate_rule', async (req, res) => {
  const { ruleId, data } = req.body;

  // Validate the ObjectId
  if (!mongoose.Types.ObjectId.isValid(ruleId)) {
    return res.status(400).json({ error: 'Invalid rule ID format.' });
  }

  try {
    // Try to find the rule by ObjectId
    const rule = await Rule.findById(ruleId);
    
    // Check if the rule was found
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found.' });
    }

    // Assuming evaluate_rule is a function you have defined elsewhere
    const result = evaluate_rule(rule.ast, data);
    res.json({ result });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: 'Server error.' });
  }
});


// This function will create a basic AST from a rule string
function create_rule(rule_string) {
    // A simple parsing example using regex. You can use libraries like PEG.js for better parsing.
    const operators = {
      AND: 'operator',
      OR: 'operator',
      '>': 'operand',
      '<': 'operand',
      '=': 'operand',
    };
  
    const ruleString = String(rule_string);

// Tokenize the rule string to extract operands and operators
const tokens = ruleString.match(/(\w+|[><=()])/g);

if (!tokens) {
  throw new Error("Failed to parse the rule string.");
}
    const stack = [];
    const root = { type: 'root', left: null, right: null };
  
    tokens.forEach((token) => {
      if (token === '(') {
        stack.push(root);
      } else if (token === ')') {
        const node = stack.pop();
        if (!node.left) node.left = root.left;
        if (!node.right) node.right = root.right;
        root.left = node;
        root.right = null;
      } else if (operators[token]) {
        const node = { type: operators[token], left: null, right: null };
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          if (!parent.left) {
            parent.left = node;
          } else {
            parent.right = node;
          }
        }
        stack.push(node);
      } else {
        const node = { type: 'operand', value: token };
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          if (!parent.left) {
            parent.left = node;
          } else {
            parent.right = node;
          }
        }
      }
    });
  
    return root;
  }
  
  

  function evaluate_rule(ast, data) {
    if (!ast) return false;
  
    switch (ast.type) {
      case 'operator':
        const leftResult = evaluate_rule(ast.left, data);
        const rightResult = evaluate_rule(ast.right, data);
        if (ast.value === 'AND') {
          return leftResult && rightResult;
        }
        if (ast.value === 'OR') {
          return leftResult || rightResult;
        }
        break;
  
      case 'operand':
        const { value } = ast;
        const [field, operator, comparison] = value.split(' ');
        const fieldValue = data[field];
        switch (operator) {
          case '>':
            return fieldValue > comparison;
          case '<':
            return fieldValue < comparison;
          case '=':
            return fieldValue == comparison; // use == for comparison
        }
        break;
  
      default:
        return false;
    }
  }
  

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});



