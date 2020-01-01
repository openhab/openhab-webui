/**
 * Copyright (c) 2010-2020 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
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
public class VariableSetBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(VariableSetBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		DesignerFieldBean varField = findField(block.fields, "VAR");
		if (varField == null) {
			logger.error("VARIABLE SET contains no VAR");
			return null;
		}

		DesignerChildBean child = findChild(block.children, "VALUE");
		if (child == null) {
			logger.error("VARIABLE SET contains no VALUE");
			return null;
		}
		String value = callBlock(ruleContext, child.block);
		
		String varType = "Number";
		String varDefault = "0";
		try {
			Integer.parseInt(value);
		} catch (NumberFormatException e) {
			varType = null;
		}
		if(varType == null) {
			if(value.equals("true") || value.equals("false")) {
				varType = "boolean";
				varDefault = "false";
			}
		}
		
		ruleContext.addGlobal("var " + varType + " " + varField.value + " = " + varDefault);
		return startLine(ruleContext.level) + varField.value + " = " + value + EOL;
	}
}
