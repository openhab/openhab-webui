/**
 * Tests for blocks-logic.js — openHAB Blockly logic blocks.
 *
 * Run these tests:
 *   npm run test:unit                                                     # all tests (also runs during Maven build)
 *   npx vitest run src/assets/definitions/blockly/blocks-logic.test.ts    # this file only
 *   npx vitest run -t "OR condition"                                      # a specific test by name
 *   npx vitest watch src/assets/definitions/blockly/blocks-logic.test.ts  # watch mode
 *
 * Test sections:
 *   Section 1:  Integration Tests — end-to-end workspace with multiple block types
 *   Section 2:  Unit Tests
 *     2a. Block & Code Generator Registration
 *     2b. oh_logic_undefined Block Definition
 *     2c. oh_logic_multiple Block Definition
 *     2d. Mutator Functionality
 *     2e. Mutator Helper Blocks (container + condition)
 *     2f. Code Generation (undefined, AND, OR)
 *     2g. Edge Cases (missing operands)
 *     2h. Runtime Evaluation (eval results)
 *     2i. Code Structure (parentheses, precedence)
 */
import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import * as Blockly from 'blockly/core'
import { javascriptGenerator } from 'blockly/javascript'
import * as en from 'blockly/msg/en'
import defineLogicBlocks from '@/assets/definitions/blockly/blocks-logic'

// Mocks for blocks-items dependencies (must be top-level)
vi.mock('@/components/model/model-picker-popup.vue', () => ({ default: {} }))
vi.mock('@/js/openhab/api', () => ({ default: { get: vi.fn() } }))

// --- Tests ---

// =============================================================================
// SECTION 1: Integration Tests
// Tests that combine multiple block types (logic, items, logging) to verify
// end-to-end code generation from a complete Blockly workspace.
// =============================================================================

describe('blocks-logic - integration', () => {
  let workspace: Blockly.WorkspaceSvg

  beforeAll(async () => {
    const { default: defineItemBlocks } = await import('@/assets/definitions/blockly/blocks-items')
    const { default: defineLoggingBlocks } = await import('@/assets/definitions/blockly/blocks-logging')
    defineLogicBlocks({})
    defineItemBlocks({})
    defineLoggingBlocks({})
  })

  beforeEach(() => {
    workspace = createTestWorkspace()
    javascriptGenerator.init(workspace)
  })

  afterEach(() => {
    workspace?.dispose()
  })

  /**
   * Integration test: Builds a blockly workspace that checks if an item's state is ON, CLOSED, or OPENED
   * using an OR logic block with 3 comparison operands inside an if-block, logging a message when true.
   *
   * Logic representation of the item state check:
   * <pre>
   * |___________________________________________________|
   * | [IF] (OR) ----------------------------------------|
   * |  |                                                |
   * |  |-- [get state of MyItem] == "ON"                |
   * |  |-- [get state of MyItem] == "OPEN"              |
   * |  |-- [get state of MyItem] == "OPENED"            |
   * |___________________________________________________|
   * | [DO]                                              |
   * |   >> [send command "CLOSE" to MyItem]             |
   * |___________________________________________________|
   * </pre>
   *
   * Expected generated code:
   * ```javascript
   * if (((items.getItem('MyItem').state == 'ON')) || ((items.getItem('MyItem').state == 'CLOSED')) || ((items.getItem('MyItem').state == 'OPENED'))) {
   *   console.info('Either one of the states is true');
   * }
   * ```
   */
  test('OR condition with item state checks and log statement', () => {
    // Build: if (state == ON || state == CLOSED || state == OPENED) { log info }

    // --- oh_logic_multiple OR with 3 operands ---
    const orBlock = workspace.newBlock('oh_logic_multiple') as any
    orBlock.setFieldValue('OR', 'operand')
    const mutation = document.createElement('mutation')
    mutation.setAttribute('children', '3')
    orBlock.domToMutation(mutation)

    // --- 3x logic_compare EQ blocks, each comparing item state to a string ---
    const states = ['ON', 'CLOSED', 'OPENED']
    for (let i = 0; i < states.length; i++) {
      const compare = workspace.newBlock('logic_compare')
      compare.setFieldValue('EQ', 'OP')

      // get state of item
      const getState = workspace.newBlock('oh_getitem_state')
      const itemPicker = workspace.newBlock('oh_item') as any
      itemPicker._updateFieldPicker('MyItem', 'MyItem')
      getState.getInput('itemName')!.connection!.connect(itemPicker.outputConnection!)
      compare.getInput('A')!.connection!.connect(getState.outputConnection!)

      // text value
      const textBlock = workspace.newBlock('text')
      textBlock.setFieldValue(states[i], 'TEXT')
      compare.getInput('B')!.connection!.connect(textBlock.outputConnection!)

      connectBlock(orBlock, compare, `OPER${i + 1}`)
    }

    // --- controls_if block ---
    const ifBlock = workspace.newBlock('controls_if')
    ifBlock.getInput('IF0')!.connection!.connect(orBlock.outputConnection!)

    // --- oh_log block in DO0 ---
    const logBlock = workspace.newBlock('oh_log')
    logBlock.setFieldValue('info', 'severity')
    const msgBlock = workspace.newBlock('text')
    msgBlock.setFieldValue('Either one of the states is true', 'TEXT')
    logBlock.getInput('message')!.connection!.connect(msgBlock.outputConnection!)
    ifBlock.getInput('DO0')!.connection!.connect(logBlock.previousConnection!)

    // --- Generate and verify ---
    const code = javascriptGenerator.workspaceToCode(workspace)

    // Verify the generated code contains the expected fragments.
    // Whitespace is normalized (newlines, indentation collapsed to single spaces)
    // so the test is resilient to formatting changes while still strictly checking
    // the code structure, operator usage, and balanced parentheses.
    const expectedCode = [
      "if (((items.getItem('MyItem').state == 'ON')) || ((items.getItem('MyItem').state == 'CLOSED')) || ((items.getItem('MyItem').state == 'OPENED')))",
      "console.info('Either one of the states is true')"
    ]

    const normalizedCode = code.replace(/\s+/g, ' ').trim()
    for (const fragment of expectedCode) {
      expect(normalizedCode).toContain(fragment)
    }

    // Verify balanced parentheses
    const open = (code.match(/\(/g) || []).length
    const close = (code.match(/\)/g) || []).length
    expect(open).toBe(close)
  })

  /**
   * Integration test: Same structure as the OR test above, but uses AND to check
   * if an item's state is simultaneously equal to three values (always false in practice,
   * but validates AND code generation with multiple operands).
   *
   * Expected generated code:
   * ```javascript
   * if (((items.getItem('MyItem').state == 'ON')) && ((items.getItem('MyItem').state == 'CLOSED')) && ((items.getItem('MyItem').state == 'OPENED'))) {
   *   console.info('All of the states are true');
   * }
   * ```
   */
  test('AND condition with item state checks and log statement', () => {
    const andBlock = workspace.newBlock('oh_logic_multiple') as any
    andBlock.setFieldValue('AND', 'operand')
    const mutation = document.createElement('mutation')
    mutation.setAttribute('children', '3')
    andBlock.domToMutation(mutation)

    const states = ['ON', 'CLOSED', 'OPENED']
    for (let i = 0; i < states.length; i++) {
      const compare = workspace.newBlock('logic_compare')
      compare.setFieldValue('EQ', 'OP')

      const getState = workspace.newBlock('oh_getitem_state')
      const itemPicker = workspace.newBlock('oh_item') as any
      itemPicker._updateFieldPicker('MyItem', 'MyItem')
      getState.getInput('itemName')!.connection!.connect(itemPicker.outputConnection!)
      compare.getInput('A')!.connection!.connect(getState.outputConnection!)

      const textBlock = workspace.newBlock('text')
      textBlock.setFieldValue(states[i], 'TEXT')
      compare.getInput('B')!.connection!.connect(textBlock.outputConnection!)

      connectBlock(andBlock, compare, `OPER${i + 1}`)
    }

    const ifBlock = workspace.newBlock('controls_if')
    ifBlock.getInput('IF0')!.connection!.connect(andBlock.outputConnection!)

    const logBlock = workspace.newBlock('oh_log')
    logBlock.setFieldValue('info', 'severity')
    const msgBlock = workspace.newBlock('text')
    msgBlock.setFieldValue('All of the states are true', 'TEXT')
    logBlock.getInput('message')!.connection!.connect(msgBlock.outputConnection!)
    ifBlock.getInput('DO0')!.connection!.connect(logBlock.previousConnection!)

    const code = javascriptGenerator.workspaceToCode(workspace)

    const expectedCode = [
      "if (((items.getItem('MyItem').state == 'ON')) && ((items.getItem('MyItem').state == 'CLOSED')) && ((items.getItem('MyItem').state == 'OPENED')))",
      "console.info('All of the states are true')"
    ]

    const normalizedCode = code.replace(/\s+/g, ' ').trim()
    for (const fragment of expectedCode) {
      expect(normalizedCode).toContain(fragment)
    }

    const open = (code.match(/\(/g) || []).length
    const close = (code.match(/\)/g) || []).length
    expect(open).toBe(close)
  })
})

// =============================================================================
// SECTION 2: Unit Tests
// Tests for individual block definitions, mutator functionality,
// code generation, edge cases, runtime evaluation, and code structure.
// =============================================================================

describe('blocks-logic', () => {
  let workspace: Blockly.WorkspaceSvg

  beforeAll(() => {
    defineLogicBlocks({})
  })

  beforeEach(() => {
    workspace = createTestWorkspace()
    javascriptGenerator.init(workspace)
  })

  afterEach(() => {
    workspace?.dispose()
  })

  // =============================================
  // 2a. Block & Code Generator Registration
  // Verifies all logic blocks are registered in
  // Blockly.Blocks and have code generators.
  // =============================================

  describe('Block Registration', () => {
    const expectedBlocks = [
      'oh_logic_undefined',
      'oh_logic_multiple',
      'oh_logic_multiple_container_block',
      'oh_logic_multiple_condition_block'
    ]

    test.each(expectedBlocks)('%s is registered in Blockly.Blocks', (blockType) => {
      expect(Blockly.Blocks[blockType]).toBeDefined()
      expect(typeof Blockly.Blocks[blockType]).toBe('object')
    })

    test.each(expectedBlocks)('%s has init method', (blockType) => {
      expect(typeof Blockly.Blocks[blockType].init).toBe('function')
    })
  })

  describe('2a - Code Generator Registration', () => {
    const expectedGenerators = ['oh_logic_undefined', 'oh_logic_multiple']

    test.each(expectedGenerators)('%s has registered code generator', (blockType) => {
      expect(javascriptGenerator.forBlock[blockType]).toBeDefined()
      expect(typeof javascriptGenerator.forBlock[blockType]).toBe('function')
    })
  })

  // =============================================
  // 2b. oh_logic_undefined Block Definition
  // Verifies connections, color, tooltip, help URL,
  // and input configuration.
  // =============================================

  describe('oh_logic_undefined Block', () => {
    test('initializes correctly', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      expect(block).toBeDefined()
      expect(block.type).toBe('oh_logic_undefined')
    })

    test('has output connection', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      expect(block.outputConnection).toBeTruthy()
    })

    test('has correct color (LOGIC_HUE)', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      expect(block.getColour()).toBe(LOGIC_HUE_COLOUR)
    })

    test('has tooltip', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      expect(block.tooltip).toBe('returns undefined as value')
    })

    test('has help URL', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      expect(block.helpUrl).toBe('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#logic')
    })

    test('has no inputs except dummy label', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      const counts = getInputCounts(block)
      expect(counts.value).toBe(0)
      expect(counts.statement).toBe(0)
      expect(counts.dummy).toBe(1)
    })

    test('has no previous or next statements', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      expect(block.previousConnection).toBeNull()
      expect(block.nextConnection).toBeNull()
    })
  })

  // =============================================
  // 2c. oh_logic_multiple Block Definition
  // Verifies dropdown, connections, type checks,
  // labels, and default operand count.
  // =============================================

  describe('oh_logic_multiple Block', () => {
    test('initializes correctly', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      expect(block).toBeDefined()
      expect(block.type).toBe('oh_logic_multiple')
    })

    test('has operand dropdown field', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      const operandField = block.getField('operand')
      expect(operandField).toBeDefined()
      expect(operandField).toBeInstanceOf(Blockly.FieldDropdown)
    })

    test('operand dropdown has AND and OR options', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      const operandField = block.getField('operand') as Blockly.FieldDropdown
      const options = operandField.getOptions()
      expect(options).toHaveLength(2)
      expect(options[0]).toEqual(['AND', 'AND'])
      expect(options[1]).toEqual(['OR', 'OR'])
    })

    test('has output connection with Boolean type', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      expect(block.outputConnection).toBeTruthy()
      expect(block.outputConnection!.getCheck()).toContain('Boolean')
    })

    test('has 2 operand inputs by default', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      expect(block.getInput('OPER1')).toBeDefined()
      expect(block.getInput('OPER2')).toBeDefined()
      expect(block.getInput('OPER3')).toBeNull()
    })

    test('operand inputs accept Boolean type', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      const input1 = block.getInput('OPER1')
      expect(input1!.connection!.getCheck()).toContain('Boolean')
    })

    test('has mutator icon', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      expect(block.mutator).toBeDefined()
    })

    test('has correct tooltip', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      expect(block.tooltip).toBe('Logical AND / OR with multiple operands')
    })

    test('has help URL', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      expect(block.helpUrl).toBe('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#logic')
    })

    test('shows "all of" label for AND', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      const labelField = block.getInput('OPERAND_LABEL')!.fieldRow.find((f) => f.name === 'OPERAND_LABEL_TEXT')
      expect(labelField!.getValue()).toBe('all of')
    })

    test('shows "any of" label for OR', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('OR', 'operand')
      const labelField = block.getInput('OPERAND_LABEL')!.fieldRow.find((f) => f.name === 'OPERAND_LABEL_TEXT')
      expect(labelField!.getValue()).toBe('any of')
    })

    test('stores numberOfChildren property', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      expect(block.numberOfChildren).toBe(2)
    })
  })

  // =============================================
  // 2d. Mutator Functionality
  // Verifies decompose/compose/saveConnections
  // methods and XML serialization round-trip.
  // =============================================

  describe('oh_logic_multiple Mutator', () => {
    test('has decompose method', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      expect(typeof block.decompose).toBe('function')
    })

    test('has compose method', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      expect(typeof block.compose).toBe('function')
    })

    test('has saveConnections method', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      expect(typeof block.saveConnections).toBe('function')
    })

    test('has mutationToDom method', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      expect(typeof block.mutationToDom).toBe('function')
    })

    test('has domToMutation method', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      expect(typeof block.domToMutation).toBe('function')
    })

    /** Verifies mutationToDom serializes the current operand count to XML. */
    test('mutationToDom creates mutation XML', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      const mutation = block.mutationToDom()
      expect(mutation).toBeDefined()
      expect(mutation.getAttribute('children')).toBe('2')
    })

    /** Verifies domToMutation restores operand count and creates the corresponding value inputs. */
    test('domToMutation restores state from XML', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      const mutation = document.createElement('mutation')
      mutation.setAttribute('children', '5')
      block.domToMutation(mutation)

      expect(block.numberOfChildren).toBe(5)
      expect(block.getInput('OPER3')).toBeDefined()
      expect(block.getInput('OPER4')).toBeDefined()
      expect(block.getInput('OPER5')).toBeDefined()
    })
  })

  // =============================================
  // 2e. Mutator Helper Blocks
  // Container and condition blocks used inside
  // the mutator dialog.
  // =============================================

  describe('Mutator Container Block', () => {
    test('initializes correctly', () => {
      const block = workspace.newBlock('oh_logic_multiple_container_block')
      expect(block).toBeDefined()
      expect(block.type).toBe('oh_logic_multiple_container_block')
    })

    test('has STACK statement input', () => {
      const block = workspace.newBlock('oh_logic_multiple_container_block')
      const stackInput = block.getInput('STACK')
      expect(stackInput).toBeDefined()
      expect(stackInput!.type).toBe(Blockly.inputs.inputTypes.STATEMENT)
    })

    test('has no context menu', () => {
      const block = workspace.newBlock('oh_logic_multiple_container_block') as any
      expect(block.contextMenu).toBe(false)
    })

    test('has correct color (LOGIC_HUE)', () => {
      const block = workspace.newBlock('oh_logic_multiple_container_block')
      expect(block.getColour()).toBe(LOGIC_HUE_COLOUR)
    })
  })

  describe('Mutator Condition Block', () => {
    test('initializes correctly', () => {
      const block = workspace.newBlock('oh_logic_multiple_condition_block')
      expect(block).toBeDefined()
      expect(block.type).toBe('oh_logic_multiple_condition_block')
    })

    test('has previous and next connections', () => {
      const block = workspace.newBlock('oh_logic_multiple_condition_block')
      expect(block.previousConnection).toBeTruthy()
      expect(block.nextConnection).toBeTruthy()
    })

    test('has no context menu', () => {
      const block = workspace.newBlock('oh_logic_multiple_condition_block') as any
      expect(block.contextMenu).toBe(false)
    })

    test('has correct color (LOGIC_HUE)', () => {
      const block = workspace.newBlock('oh_logic_multiple_condition_block')
      expect(block.getColour()).toBe(LOGIC_HUE_COLOUR)
    })
  })

  // =============================================
  // 2f. Code Generation
  // Verifies generated JavaScript code patterns,
  // operator usage, and syntax validity for
  // oh_logic_undefined and oh_logic_multiple.
  // =============================================

  describe('oh_logic_undefined Code Generation', () => {
    test('generates undefined literal', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      const [code, order] = generateBlockCode(block)
      expect(code).toBe('undefined')
      expect(order).toBe(javascriptGenerator.ORDER_ATOMIC)
    })

    test('generates valid JavaScript', () => {
      workspace.newBlock('oh_logic_undefined')
      const code = javascriptGenerator.workspaceToCode(workspace)
      expect(isValidJavaScript(code)).toBe(true)
    })

    test('evaluates to undefined at runtime', () => {
      const block = workspace.newBlock('oh_logic_undefined')
      const [code] = generateBlockCode(block)
      expect(eval(code)).toBeUndefined()
    })
  })

  describe('oh_logic_multiple AND Operations', () => {
    test('generates AND with 2 true operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code, order] = generateBlockCode(block)
      expect(code).toMatch(/\(true\)\s*&&\s*\(true\)/)
      expect(order).toBe(javascriptGenerator.ORDER_ATOMIC)
      expectBalancedParentheses(code)
    })

    test('generates AND with 2 false operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(false\)\s*&&\s*\(false\)/)
      expectBalancedParentheses(code)
    })

    test('generates AND with mixed operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(true\)\s*&&\s*\(false\)/)
      expectBalancedParentheses(code)
    })

    /** Uses the mutator to expand to 5 operands and verifies 4 && operators are generated. */
    test('generates AND with 5 operands', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      block.setFieldValue('AND', 'operand')
      const mutation = document.createElement('mutation')
      mutation.setAttribute('children', '5')
      block.domToMutation(mutation)

      for (let i = 1; i <= 5; i++) {
        connectBlock(block, createBoolBlock(workspace, 'TRUE'), `OPER${i}`)
      }

      const [code] = generateBlockCode(block)
      const andCount = (code.match(/&&/g) || []).length
      expect(andCount).toBe(4)
      expect(code).toMatch(/^\(true\)/)
      expect(code).toMatch(/\(true\)$/)
      expectBalancedParentheses(code)
    })

    test('AND with 2 operands generates valid JavaScript', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER2')

      const code = javascriptGenerator.workspaceToCode(workspace)
      expect(isValidJavaScript(code)).toBe(true)
    })
  })

  describe('oh_logic_multiple OR Operations', () => {
    test('generates OR with 2 true operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('OR', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code, order] = generateBlockCode(block)
      expect(code).toMatch(/\(true\)\s*\|\|\s*\(true\)/)
      expect(order).toBe(javascriptGenerator.ORDER_ATOMIC)
      expectBalancedParentheses(code)
    })

    test('generates OR with 2 false operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('OR', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(false\)\s*\|\|\s*\(false\)/)
      expectBalancedParentheses(code)
    })

    test('generates OR with mixed operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('OR', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(false\)\s*\|\|\s*\(true\)/)
      expectBalancedParentheses(code)
    })

    test('generates OR with 3 operands', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      block.setFieldValue('OR', 'operand')
      const mutation = document.createElement('mutation')
      mutation.setAttribute('children', '3')
      block.domToMutation(mutation)

      for (let i = 1; i <= 3; i++) {
        connectBlock(block, createBoolBlock(workspace, 'FALSE'), `OPER${i}`)
      }

      const [code] = generateBlockCode(block)
      const orCount = (code.match(/\|\|/g) || []).length
      expect(orCount).toBe(2)
      expectBalancedParentheses(code)
    })
  })

  // =============================================
  // 2g. Edge Cases
  // Verifies behavior when operands are missing
  // (disconnected inputs default to 'false').
  // =============================================

  describe('Operand Handling', () => {
    /** When OPER1 is not connected, the code generator defaults it to 'false'. */
    test('handles missing first operand', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(false\)\s*&&\s*\(true\)/)
      expectBalancedParentheses(code)
    })

    test('handles missing second operand', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(true\)\s*&&\s*\(false\)/)
      expectBalancedParentheses(code)
    })

    test('handles all missing operands', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(false\)\s*&&\s*\(false\)/)
      expectBalancedParentheses(code)
    })
  })

  // =============================================
  // 2h. Runtime Evaluation
  // Executes generated code via eval() and verifies
  // the result matches expected boolean/undefined values.
  // =============================================

  describe('Runtime Evaluation', () => {
    test('AND with all true evaluates to true', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(eval(code)).toBe(true)
    })

    test('AND with any false evaluates to false', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(eval(code)).toBe(false)
    })

    test('OR with any true evaluates to true', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('OR', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(eval(code)).toBe(true)
    })

    test('OR with all false evaluates to false', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('OR', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'FALSE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(eval(code)).toBe(false)
    })

    /** JavaScript short-circuit: undefined && true evaluates to undefined (falsy). */
    test('undefined in AND operation', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, workspace.newBlock('oh_logic_undefined'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(eval(code)).toBeUndefined()
    })
  })

  // =============================================
  // 2i. Code Structure
  // Verifies parenthesization and operator
  // precedence in generated output.
  // =============================================

  describe('Code Structure', () => {
    /** Verifies each operand is wrapped in parentheses to avoid precedence issues. */
    test('properly parenthesizes each operand', () => {
      const block = workspace.newBlock('oh_logic_multiple')
      block.setFieldValue('AND', 'operand')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER1')
      connectBlock(block, createBoolBlock(workspace, 'TRUE'), 'OPER2')

      const [code] = generateBlockCode(block)
      expect(code.match(/\([^)]+\)/g)!.length).toBeGreaterThanOrEqual(2)
    })

    /** Verifies left-to-right evaluation with 3 operands: (true) && (true) && (true). */
    test('maintains correct operator precedence with 3 operands', () => {
      const block = workspace.newBlock('oh_logic_multiple') as any
      block.setFieldValue('AND', 'operand')
      const mutation = document.createElement('mutation')
      mutation.setAttribute('children', '3')
      block.domToMutation(mutation)

      for (let i = 1; i <= 3; i++) {
        connectBlock(block, createBoolBlock(workspace, 'TRUE'), `OPER${i}`)
      }

      const [code] = generateBlockCode(block)
      expect(code).toMatch(/\(true\)\s*&&\s*\(true\)\s*&&\s*\(true\)/)
    })
  })
})

// =============================================================================
// Test Helpers & Constants
// =============================================================================

const LOGIC_HUE_COLOUR = Blockly.utils.colour.hueToHex(parseInt(Blockly.Msg['LOGIC_HUE']))

let blocklyInitialized = false
function ensureBlocklyInitialized() {
  if (!blocklyInitialized) {
    Blockly.setLocale(en)
    blocklyInitialized = true
  }
}

/** Creates a headless Blockly workspace using jsdom for testing. */
function createTestWorkspace(): Blockly.WorkspaceSvg {
  ensureBlocklyInitialized()
  const div = document.createElement('div')
  div.style.display = 'none'
  document.body.appendChild(div)
  return Blockly.inject(div, { renderer: 'geras' })
}

/** Connects a child block's output to a named value input on a parent block. */
function connectBlock(parent: Blockly.Block, child: Blockly.Block, inputName: string) {
  parent.getInput(inputName)!.connection!.connect(child.outputConnection!)
}

/** Creates a standard Blockly boolean block with the given value. */
function createBoolBlock(workspace: Blockly.Workspace, value: 'TRUE' | 'FALSE'): Blockly.Block {
  const block = workspace.newBlock('logic_boolean')
  block.setFieldValue(value, 'BOOL')
  return block
}

/**
 * Generates code for a single block by directly invoking its registered code generator.
 * Initializes the generator first to avoid warnings.
 * @returns Tuple of [generatedCode, operatorPrecedenceOrder].
 */
function generateBlockCode(block: Blockly.Block): [string, number] {
  javascriptGenerator.init(block.workspace)
  return javascriptGenerator.forBlock[block.type](block, javascriptGenerator) as [string, number]
}

/** Returns counts of value, statement, and dummy inputs on a block. */
function getInputCounts(block: Blockly.Block) {
  const inputs = block.inputList
  return {
    total: inputs.length,
    value: inputs.filter((i) => i.type === Blockly.inputs.inputTypes.VALUE).length,
    statement: inputs.filter((i) => i.type === Blockly.inputs.inputTypes.STATEMENT).length,
    dummy: inputs.filter((i) => i.type === Blockly.inputs.inputTypes.DUMMY).length
  }
}

/** Checks if a code string is syntactically valid JavaScript by attempting to parse it as a Function body. */
function isValidJavaScript(code: string): boolean {
  try {
    new Function(code)
    return true
  } catch {
    return false
  }
}

/** Verifies that opening and closing parentheses are balanced in the given code string. */
function expectBalancedParentheses(code: string) {
  const open = (code.match(/\(/g) || []).length
  const close = (code.match(/\)/g) || []).length
  expect(open, `unbalanced parentheses in: ${code}`).toBe(close)
  expect(open, `expected parentheses in: ${code}`).toBeGreaterThan(0)
}
