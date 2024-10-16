const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a recursive schema for AST nodes
const nodeSchema = new Schema({
    type: {
      type: String,
      required: true,
      enum: ['operator', 'operand', 'root'] // Include 'root' as a valid type if needed
    },
    value: {
      type: Schema.Types.Mixed,
      required: function() { return this.type === 'operand'; }
    },
    left: {
      type: Schema.Types.Mixed,
      ref: 'Node'
    },
    right: {
      type: Schema.Types.Mixed,
      ref: 'Node'
    }
  });
  

// Main schema to store rules with an AST
const ruleSchema = new Schema({
  ruleName: {
    type: String,
    required: true
  },
  ast: {
    type: nodeSchema, // Embed the node schema directly
    required: true
  }
});

const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule;
