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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class MathConstrainBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(MathConstrainBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();
		DesignerChildBean child;

		child = findChild(block.children, "VALUE");
		if (child == null) {
			logger.error("MATH CONSTRAIN contains no VALUE");
			return null;
		}
		String blockValue = callBlock(ruleContext, child.block);

		child = findChild(block.children, "LOW");
		if (child == null) {
			logger.error("MATH CONSTRAIN contains no LOW");
			return null;
		}
		String blockLow = callBlock(ruleContext, child.block);

		child = findChild(block.children, "HIGH");
		if (child == null) {
			logger.error("MATH CONSTRAIN contains no HIGH");
			return null;
		}
		String blockHigh = callBlock(ruleContext, child.block);

		blockString = "if(" + blockValue + ">" + blockHigh + ") " + blockHigh + EOL;
		blockString = "if(" + blockValue + "<" + blockLow + ") " + blockLow + EOL;
		return blockString;
	}
}
