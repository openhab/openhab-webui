/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.designer.blocks;

import org.openhab.ui.habmin.internal.services.designer.DesignerBlockBean;
import org.openhab.ui.habmin.internal.services.designer.DesignerChildBean;
import org.openhab.ui.habmin.internal.services.designer.DesignerFieldBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class LogicCompareBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(LogicCompareBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();
		DesignerChildBean child;

		child = findChild(block.children, "A");
		if (child == null) {
			logger.error("LOGIC COMPARE contains no A");
			return null;
		}
		String blockA = callBlock(ruleContext, child.block);

		child = findChild(block.children, "B");
		if (child == null) {
			logger.error("LOGIC COMPARE contains no B");
			return null;
		}
		String blockB = callBlock(ruleContext, child.block);

		DesignerFieldBean operatorField = findField(block.fields, "OP");
		if(operatorField == null) {
			logger.error("LOGIC COMPARE contains no field OP");
			return null;
		}
		Operators op = Operators.valueOf(operatorField.value.toUpperCase());
		if(op == null) {
			logger.error("LOGIC COMPARE contains invalid field OP ({})", operatorField.name.toUpperCase());
			return null;
		}

		// No type casting required with comparisons
		
		// If this is an item, then we need to add '.state'

		String A = blockA;
		if(getItem(blockA) != null) {
			A += ".state";
		}


		String B = blockB;
		if(getItem(blockB) != null) {
			B += ".state";
		}
		
		blockString = "(" + A + " " + op.toString() + " " + B + ")";
		return blockString;
	}

	enum Operators {
		GT(">"), GTE(">="), LT("<"), LTE("<="), EQ("=="), NEQ("!=");

		private String value;

		private Operators(String value) {
			this.value = value;
		}

		public static Operators fromString(String text) {
			if (text != null) {
				for (Operators c : Operators.values()) {
					if (text.equalsIgnoreCase(c.name())) {
						return c;
					}
				}
			}
			return null;
		}

		public String toString() {
			return this.value;
		}
	}
}
