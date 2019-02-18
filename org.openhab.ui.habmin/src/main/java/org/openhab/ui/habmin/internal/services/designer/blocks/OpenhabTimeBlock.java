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
 * @since 1.6.0
 * 
 */
public class OpenhabTimeBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(OpenhabTimeBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {
		String blockString = new String();
		DesignerFieldBean field;
		
		// We need Jodatime
		ruleContext.addImport("org.joda.time.*");

		// Add a comment if there is one
		if (block.comment != null) {
			String[] comments = block.comment.text.split("\\r?\\n");
			for (String comment : comments)
				blockString += startLine(ruleContext.level) + "// " + comment + "\r\n";
		}

		field = findField(block.fields, "COMPARE");
		if (field == null) {
			logger.error("OPENHAB TIME contains no COMPARE.");
			return null;
		}
		Compare compare = Compare.valueOf(field.value);
		if (compare == null) {
			logger.error("OPENHAB TIME contains invalid COMPARE.");
			return null;
		}

		field = findField(block.fields, "HOUR");
		if (field == null) {
			logger.error("OPENHAB TIME contains no HOUR.");
			return null;
		}
		Integer hour = Integer.valueOf(field.value);
		if (hour == null) {
			logger.error("OPENHAB TIME contains invalid HOUR.");
			return null;
		}

		field = findField(block.fields, "MIN");
		if (field == null) {
			logger.error("OPENHAB TIME contains no MIN.");
			return null;
		}
		Integer min = Integer.valueOf(field.value);
		if (min == null) {
			logger.error("OPENHAB TIME contains invalid MIN.");
			return null;
		}
		
		// Add CRON trigger
		if(min != 0) {
			// Minutes is set, so wake up every minute
			ruleContext.setCron(60);
		}
		else if(hour != 0) {
			// Hour is set, so wake up every hour
			ruleContext.setCron(3600);
		}
		else {
			// Hour and minute are 0, so this is midnight - just wake up once per day
			ruleContext.setCron(86400);
		}

		blockString = "((new LocalTime().getLocalMillis()) " + compare.toString() + " (new LocalTime(" + hour + ", " + min + ", 0, 0).getLocalMillis()))";
		
		return blockString;		
	}

	enum Compare {
		BEFORE("<="), AFTER(">=");

		private String value;

		private Compare(String value) {
			this.value = value;
		}

		public static Compare fromString(String text) {
			if (text != null) {
				for (Compare c : Compare.values()) {
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
