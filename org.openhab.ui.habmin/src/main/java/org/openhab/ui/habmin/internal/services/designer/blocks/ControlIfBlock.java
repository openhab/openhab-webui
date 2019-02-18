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
import org.openhab.ui.habmin.internal.services.designer.DesignerMutationBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class ControlIfBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(ControlIfBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();
		String response;
		DesignerChildBean child;

		// Add a comment if there is one
		if (block.comment != null) {
			String[] comments = block.comment.text.split("\\r?\\n");
			for (String comment : comments)
				blockString += startLine(ruleContext.level) + "// " + comment + "\r\n";
		}

		// Check how many if/then/else we have
		DesignerMutationBean mutation;
		mutation = findMutation(block.mutation, "elseif");
		int elseif = 1;
		if (mutation != null)
			elseif += Integer.parseInt(mutation.value);

		for (int x = 0; x < elseif; x++) {
			// Process the IF...
			child = findChild(block.children, "IF" + x);
			if (child == null) {
				logger.error("IF CONTROL contains no IF{} (mutation count was {}).", x, elseif - 1);
				return null;
			}
			ruleContext.level++;
			response = callBlock(ruleContext, child.block);
			ruleContext.level--;
//			if(response == null)
//				return null;
			if(x == 0) {
				blockString += startLine(ruleContext.level) + "if (" + response + ") {" + EOL;
			}
			else {
				blockString += startLine(ruleContext.level) + "else if (" + response + ") {" + EOL;
			}

			// And then the DO...
			child = findChild(block.children, "DO" + x);
			if (child == null) {
				logger.error("IF CONTROL contains no DO{} (mutation count was {}).", x, elseif - 1);
				return null;
			}
			
			ruleContext.level++;
			response = callBlock(ruleContext, child.block);
			ruleContext.level--;
//			if(response == null)
//				return null;
			blockString += response;
			blockString += startLine(ruleContext.level) + "}" + EOL;
		}

		mutation = findMutation(block.mutation, "else");
		if (mutation != null) {
			// Finally process the ELSE if it exists
			child = findChild(block.children, "ELSE");
			if (child != null) {
				response = callBlock(ruleContext, child.block);
//				if(response == null)
//					return null;
				blockString += startLine(ruleContext.level) + "else {" + EOL;
				blockString += response;
				blockString += startLine(ruleContext.level) + "}" + EOL;
			}
		}

		return blockString;
	}
}
