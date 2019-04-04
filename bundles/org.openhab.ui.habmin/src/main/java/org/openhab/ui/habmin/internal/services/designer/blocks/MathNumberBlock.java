/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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
import org.openhab.ui.habmin.internal.services.designer.DesignerFieldBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class MathNumberBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(MathNumberBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		DesignerFieldBean numField = findField(block.fields, "NUM");
		if (numField == null) {
			logger.error("MATH NUMBER contains no NUM");
			return null;
		}

		return numField.value;
	}
}
