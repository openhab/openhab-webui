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
public class OpenhabStateOpenClosedBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(OpenhabStateOpenClosedBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();

		DesignerFieldBean operatorField = findField(block.fields, "STATE");
		if(operatorField == null) {
			logger.error("OPENHAB STATE OPENCLOSED contains no field STATE");
			return null;
		}
		Operators op = Operators.valueOf(operatorField.value.toUpperCase());
		if(op == null) {
			logger.error("OPENHAB STATE OPENCLOSED contains invalid field STATE ({})", operatorField.name.toUpperCase());
			return null;
		}

		blockString = op.toString();
		return blockString;
	}
	
	enum Operators {
		OPEN, CLOSED;
	}
}
