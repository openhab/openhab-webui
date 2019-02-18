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
public class OpenhabIfTimerBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(OpenhabIfTimerBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();
		String response;
		DesignerChildBean child;
		DesignerFieldBean field;

		String timerID = "_timer" + ruleContext.getGlobalId();
		ruleContext.addGlobal("var Timer " + timerID + " = null");

		// Add a comment if there is one
		if (block.comment != null) {
			String[] comments = block.comment.text.split("\\r?\\n");
			for (String comment : comments)
				blockString += startLine(ruleContext.level) + "// " + comment + "\r\n";
		}

		// Process the IF...
		child = findChild(block.children, "IF0");
		if (child == null) {
			logger.error("OPENHAB IF TIMER contains no IF0.");
			return null;
		}
		response = callBlock(ruleContext, child.block);

		blockString += startLine(ruleContext.level) + "if (" + response + ") {" + EOL;

		ruleContext.level++;
		blockString += startLine(ruleContext.level) + "if (" + timerID + " == null) {" + EOL;
		
		field = findField(block.fields, "PERIOD");
		if (field == null) {
			logger.error("OPENHAB IF TIMER contains no PERIOD.");
			return null;
		}

		Period period = Period.fromString(field.value);
		if (period == null) {
			logger.error("OPENHAB IF TIMER contains invalid PERIOD.");
			return null;
		}

		field = findField(block.fields, "NUM");
		if (field == null) {
			logger.error("OPENHAB IF TIMER contains no NUM.");
			return null;
		}

		// Now add the timer
		ruleContext.level++;
		blockString += startLine(ruleContext.level) + timerID + " = createTimer(now.plus" + period.toString() + "("
				+ field.value + ")) [|" + EOL;

		ruleContext.level++;

		// And the code to stop the timer once it's run
		blockString += startLine(ruleContext.level) + timerID + ".cancel()" + EOL;
		blockString += startLine(ruleContext.level) + timerID + " = null" + EOL;

		// And then the DO...
		child = findChild(block.children, "DO0");
		if (child == null) {
			logger.error("OPENHAB IF TIMER contains no DO0");
			return null;
		}
		blockString += callBlock(ruleContext, child.block);
		ruleContext.level--;

		blockString += startLine(ruleContext.level) + "]" + EOL;
		ruleContext.level--;

		// Terminate the timer block
		blockString += startLine(ruleContext.level) + "}" + EOL;
		ruleContext.level--;
		blockString += startLine(ruleContext.level) + "}" + EOL;

		// And the cancel timer part...
		blockString += startLine(ruleContext.level) + "else if(" + timerID + " != null) {" + EOL;
		ruleContext.level++;
		blockString += startLine(ruleContext.level) + timerID + ".cancel()" + EOL;
		blockString += startLine(ruleContext.level) + timerID + " = null" + EOL;
		ruleContext.level--;
		blockString += startLine(ruleContext.level) + "}" + EOL;

		return blockString;
	}

	enum Period {
		SECONDS("Seconds"), MINUTES("Minutes"), HOURS("Hours");

		private String value;

		private Period(String value) {
			this.value = value;
		}

		public static Period fromString(String text) {
			if (text != null) {
				for (Period c : Period.values()) {
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
