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
import org.openhab.ui.habmin.internal.services.designer.DesignerFieldBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class OpenhabStateOnOffBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(OpenhabStateOnOffBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();

		DesignerFieldBean operatorField = findField(block.fields, "STATE");
		if(operatorField == null) {
			logger.error("OPENHAB STATE ONOFF contains no field STATE");
			return null;
		}
		Operators op = Operators.valueOf(operatorField.value.toUpperCase());
		if(op == null) {
			logger.error("OPENHAB STATE ONOFF contains invalid field STATE ({})", operatorField.name.toUpperCase());
			return null;
		}

		blockString = op.toString();
		return blockString;
	}
	
	enum Operators {
		ON, OFF;
	}
}
