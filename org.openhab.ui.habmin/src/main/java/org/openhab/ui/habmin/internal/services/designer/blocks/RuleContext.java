/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.designer.blocks;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class acts as a store for the context within the scope of a rule
 * @author Chris Jackson
 * @since 1.5.0
 * 
 */
public class RuleContext {
	private static final Logger logger = LoggerFactory.getLogger(RuleContext.class);

	List<Trigger> triggerList = new ArrayList<Trigger>();
	List<String> importList = new ArrayList<String>();
	List<String> globalList = new ArrayList<String>();
	HashMap<String, String> constantList = new HashMap<String, String>();

	int cronTime = 0;

	int ruleId = 0;
	int globalId = 0;
	
	int level = 0;

	RuleContext(int id) {
		ruleId = id;
	}
	
	String getGlobalId() {
		int a = globalId / 26;
		int b = globalId % 26;
		
		String id = String.format("_%03d_", ruleId);
		if(a > 0) {
			id += (char)(a + 'A');
		}
		id += (char)(b + 'A');

		globalId++;
		
		return id;
	}

	List<Trigger> getTriggerList() {
		return triggerList;
	}

	void addTrigger(String item, TriggerType type) {
		// Check if this trigger already exists
		for(Trigger trigger : triggerList) {
			if(!trigger.item.equalsIgnoreCase(item))
				continue;
			if(trigger.type == TriggerType.COMMAND && type == TriggerType.COMMAND)
				return;
			// This trigger already exists - if either are UPDATED, then set to UPDATED
			if(trigger.type == TriggerType.UPDATED || type == TriggerType.UPDATED)
				trigger.type = TriggerType.UPDATED;
			return;
		}
		Trigger trigger = new Trigger();
		trigger.item = item;
		trigger.type = type;

		triggerList.add(trigger);
	}
	
	void addConstant(String name, String value) {
		constantList.put(name, value);
	}

	String getConstant(String name) {
		return constantList.get(name);
	}

	HashMap<String, String> getConstantList() {
		return constantList;
	}
	
	List<String> getImportList() {
		return importList;
	}
	
	void addImport(String newImport) {
		for(String s : importList) {
			if(s.equals(newImport))
				return;
		}
		importList.add(newImport);
	}

	List<String> getGlobalList() {
		return globalList;
	}
	
	void addGlobal(String newGlobal) {
		for(String s : globalList) {
			if(s.equals(newGlobal))
				return;
		}
		globalList.add(newGlobal);
	}

	void setCron(int time) {
		if(time == 0)
			return;
		if(cronTime == 0)
			cronTime = time;
		if(time < cronTime)
			cronTime = time;
	}

	int getCron() {
		return cronTime;
	}
	
	class Trigger {
		String item;
		TriggerType type;
		String value1;
		String value2;
	}
	
	enum TriggerType {
		CHANGED("changed"), UPDATED("received update"), COMMAND("received command");

			private String value;

			private TriggerType(String value) {
				this.value = value;
			}

			public static TriggerType fromString(String text) {
				if (text != null) {
					for (TriggerType c : TriggerType.values()) {
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

	enum CronType {
		STARTED(0, "System started"),
		SHUTDOWN(0, "System shutdown"),
		MIDNIGHT(0, "Time is midnight"), 
		MIDDAY(0, "Time is midday"),
		CRON5SECONDS(5, "Time cron \"0/5 * * * * ?\""),
		CRON6SECONDS(6, "Time cron \"0/6 * * * * ?\""),
		CRON7SECONDS(7, "Time cron \"0/7 * * * * ?\""),
		CRON8SECONDS(8, "Time cron \"0/8 * * * * ?\""),
		CRON9SECONDS(9, "Time cron \"0/9 * * * * ?\""),
		CRON10SECONDS(10, "Time cron \"0/10 * * * * ?\""),
		CRON11SECONDS(11, "Time cron \"0/11 * * * * ?\""),
		CRON12SECONDS(12, "Time cron \"0/12 * * * * ?\""),
		CRON13SECONDS(13, "Time cron \"0/13 * * * * ?\""),
		CRON14SECONDS(14, "Time cron \"0/14 * * * * ?\""),
		CRON15SECONDS(15, "Time cron \"0/15 * * * * ?\""),
		CRON20SECONDS(20, "Time cron \"0/20 * * * * ?\""),
		CRON30SECONDS(30, "Time cron \"0/30 * * * * ?\""),
		CRON1MINUTE(60, "Time cron \"0 * * * * ?\""),
		CRON2MINUTE(120, "Time cron \"0 0/2 * * * ?\""),
		CRON3MINUTE(180, "Time cron \"0 0/3 * * * ?\""),
		CRON4MINUTE(240, "Time cron \"0 0/4 * * * ?\""),
		CRON5MINUTE(300, "Time cron \"0 0/5 * * * ?\""),
		CRON6MINUTE(360, "Time cron \"0 0/6 * * * ?\""),
		CRON7MINUTE(420, "Time cron \"0 0/7 * * * ?\""),
		CRON8MINUTE(480, "Time cron \"0 0/8 * * * ?\""),
		CRON9MINUTE(540, "Time cron \"0 0/9 * * * ?\""),
		CRON10MINUTE(600, "Time cron \"0 0/10 * * * ?\""),
		CRON15MINUTE(900, "Time cron \"0 0/15 * * * ?\""),
		CRON20MINUTE(1200, "Time cron \"0 0/20 * * * ?\""),
		CRON30MINUTE(1800, "Time cron \"0 0/30 * * * ?\""),
		CRON1HOUR(3600, "Time cron \"0 0 * * * ?\""),
		CRON2HOUR(7200, "Time cron \"0 0 0/2 * * ?\""),
		CRON3HOUR(10800, "Time cron \"0 0 0/3 * * ?\""),
		CRON4HOUR(14400, "Time cron \"0 0 0/4 * * ?\""),
		CRON6HOUR(21600, "Time cron \"0 0 0/6 * * ?\""),
		CRON8HOUR(28800, "Time cron \"0 0 0/8 * * ?\""),
		CRON12HOUR(43200, "Time cron \"0 0 0/12 * * ?\""),
		CRON1DAY(86400, "Time cron \"0 0 0 * * ?\""),
		CRONFOREVER(Integer.MAX_VALUE, "Time cron \"0 0 0 * * ?\"");

		private int period;
		private String value;

		private CronType(int period, String value) {
			this.period = period;
			this.value = value;
		}

		// Find the value closest to, but below, the requested period
		public static CronType fromPeriod(int period) {
			// Don't allow anything faster than 5 seconds!
			CronType lowest = null;
			for (CronType c : CronType.values()) {
				// Ignore non-cron statements
				if (c.period == 0)
					continue;
				if (lowest == null)
					lowest = c;
				if (period > lowest.period && c.period <= period) {
					lowest = c;
				}
			}
			return lowest;
		}

		public static CronType fromString(String text) {
			if (text != null) {
				for (CronType c : CronType.values()) {
					if (text.equalsIgnoreCase(c.name())) {
						return c;
					}
				}
			}
			return null;
		}

		// TODO: Maybe we should randomise the seconds, so not all rules trigger at exactly the same time!?!
		public String toString() {
			return this.value;
		}
	}
}
