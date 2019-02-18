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
import org.openhab.ui.habmin.internal.services.designer.blocks.RuleContext.TriggerType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class OpenhabPersistenceGetBlock extends DesignerRuleCreator {
	private static final Logger logger = LoggerFactory.getLogger(OpenhabPersistenceGetBlock.class);

	String processBlock(RuleContext ruleContext, DesignerBlockBean block) {

		//addImport("import org.openhab.core.persistence.*");
	
		String blockString = new String();
		DesignerFieldBean field;

		DesignerFieldBean varField = findField(block.fields, "ITEM");
		if (varField == null) {
			logger.error("PERSISTENCE GET contains no VAR");
			return null;
		}
		field = findField(block.fields, "PERIOD");
		if (field == null) {
			logger.error("PERSISTENCE GET TIMER contains no PERIOD.");
			return null;
		}

		Period period = Period.fromString(field.value);
		if (period == null) {
			logger.error("PERSISTENCE GET TIMER contains invalid PERIOD.");
			return null;
		}

		field = findField(block.fields, "NUM");
		if (field == null) {
			logger.error("PERSISTENCE GET TIMER contains no NUM.");
			return null;
		}

		int periodNum = Integer.parseInt(field.value);
		int timeSeconds = 0;

		switch(period) {
		case SECONDS:
			timeSeconds = periodNum;
			break;
		case MINUTES:
			timeSeconds = periodNum * 60;
			break;
		case HOURS:
			timeSeconds = periodNum * 3600;
			break;
		}

		DesignerFieldBean typeField = findField(block.fields, "TYPE");
		if(typeField == null) {
			logger.error("PERSISTENCE GET contains no field TYPE");
			return null;
		}

		Operators type = Operators.valueOf(typeField.value.toUpperCase());
		if(type == null) {
			logger.error("PERSISTENCE GET contains invalid field TYPE ({})", typeField.name.toUpperCase());
			return null;
		}

		// Add triggers
		// We simply add a timer - 500th of the persistence period seems like a good place to start (?)
		ruleContext.setCron(timeSeconds / 500);

		String val = varField.value;
		if(getItem(val) != null) {
			ruleContext.addTrigger(varField.value, TriggerType.CHANGED);
		}

		// Generate the rule string
		blockString = varField.value + "." + type.toString() + "(now.minus" + period.toString() + "(" + periodNum + ")).state";
		return blockString;
	}
	
	enum Operators {
		STATE("historicState"),
		CHANGED("changedSince"),
		UPDATED("updatedSince"),
		AVERAGE("averageSince"),
		MINIMUM("minimumSince"),
		MAXIMUM("maximumSince");
		
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
