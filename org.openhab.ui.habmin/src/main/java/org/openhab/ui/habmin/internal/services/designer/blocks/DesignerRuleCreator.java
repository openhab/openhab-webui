/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.designer.blocks;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.eclipse.smarthome.config.core.ConfigConstants;
import org.eclipse.smarthome.core.items.Item;
import org.openhab.ui.habmin.internal.services.designer.DesignerBlockBean;
import org.openhab.ui.habmin.internal.services.designer.DesignerChildBean;
import org.openhab.ui.habmin.internal.services.designer.DesignerFieldBean;
import org.openhab.ui.habmin.internal.services.designer.DesignerMutationBean;
import org.openhab.ui.habmin.internal.services.designer.DesignerResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class acts as a block factory and provides most of the core
 * functionality.
 *
 * @author Chris Jackson
 * @since 1.5.0
 *
 */
public abstract class DesignerRuleCreator {
    private static final Logger logger = LoggerFactory.getLogger(DesignerRuleCreator.class);

    final static String EOL = "\r\n";

    final static String ruleExtension = ".rules";

    public static final String PATH_RULES = "rules/";

    abstract String processBlock(RuleContext ruleContext, DesignerBlockBean block);

    String callBlock(RuleContext context, DesignerBlockBean block) {
        if (block == null) {
            logger.error("Block is null!");
            return null;
        }

        // Get the block processor
        DesignerRuleCreator processor = getBlockProcessor(block.type);
        if (processor == null) {
            logger.error("Error finding processor for block type '{}'.", block.type);
            return EOL + "*** Unknown Block \"" + block.type + "\"" + EOL;
        }

        // Process the block
        String blockString = processor.processBlock(context, block);
        if (blockString == null) {
            return null;
        }

        if (block.next != null) {
            blockString += EOL;
            blockString += callBlock(context, block.next);
        }

        // And we're done
        return blockString;
    }

    String startLine(int level) {
        String line = new String();
        for (int c = 0; c < level; c++) {
            line += "  ";
        }

        return line;
    };

    protected Item getItem(String name) {
        try {
            if (DesignerResource.getItemRegistry() == null) {
                return null;
            }
            return DesignerResource.getItemRegistry().getItem(name);
        } catch (org.eclipse.smarthome.core.items.ItemNotFoundException e) {
            return null;
        }
    }

    DesignerChildBean findChild(List<DesignerChildBean> children, String name) {
        if (children == null) {
            return null;
        }
        for (DesignerChildBean child : children) {
            if (child.name == null) {
                continue;
            }
            if (child.name.equalsIgnoreCase(name)) {
                return child;
            }
        }
        return null;
    }

    DesignerMutationBean findMutation(List<DesignerMutationBean> mutations, String name) {
        if (mutations == null) {
            return null;
        }
        for (DesignerMutationBean mutation : mutations) {
            if (mutation.name == null) {
                continue;
            }
            if (mutation.name.equalsIgnoreCase(name)) {
                return mutation;
            }
        }
        return null;
    }

    DesignerFieldBean findField(List<DesignerFieldBean> fields, String name) {
        if (fields == null) {
            return null;
        }
        for (DesignerFieldBean field : fields) {
            if (field.name == null) {
                continue;
            }
            if (field.name.equalsIgnoreCase(name)) {
                return field;
            }
        }
        return null;
    }

    public static String makeRule(int id, String name, DesignerBlockBean rootBlock) {
        // Check we're sane!
        if (rootBlock.fields == null) {
            logger.error("Root block doesn't contain any fields.");
            return null;
        }
        if (!rootBlock.type.equalsIgnoreCase("openhab_rule")) {
            logger.error("Root block type is not an openhab rule.");
            return null;
        }
        if (rootBlock.children == null) {
            logger.error("Root block has no children.");
            return null;
        }
        if (rootBlock.children.size() == 0) {
            logger.error("Root block has no children.");
            return null;
        }
        if (name == null) {
            logger.error("Rule has no name.");
            return null;
        }

        // Trim any whitespace
        name = name.trim();

        RuleContext context = new RuleContext(id);

        DesignerRuleCreator processor = getBlockProcessor(rootBlock.type);
        if (processor == null) {
            logger.error("Error finding processor for ROOT block type '{}'.", rootBlock.type);
            return null;
        }

        // Process the block
        String ruleString = processor.callBlock(context, rootBlock);
        if (ruleString == null) {
            return null;
        }

        String outputString = new String();

        // Write a warning!
        outputString += "// This rule file is autogenerated by HABmin." + EOL;
        outputString += "// Any changes made manually to this file will be overwritten next time HABmin rules are saved."
                + EOL;
        outputString += EOL;

        if (context.getImportList().size() != 0) {
            outputString += "// Imports" + EOL;
            for (String i : context.getImportList()) {
                outputString += "import " + i + EOL;
            }
            outputString += EOL;
        }

        if (context.getImportList().size() != 0) {
            outputString += "// Global Variables" + EOL;
            for (String i : context.getGlobalList()) {
                outputString += i + EOL;
            }
            outputString += EOL;
        }

        // Write the constants if there are any - just for reference
        if (context.getConstantList().size() != 0) {
            outputString += "// Constants used to generate this rule" + EOL;
            Iterator it = context.getConstantList().entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry pairs = (Map.Entry) it.next();
                outputString += "// " + pairs.getKey() + " == " + pairs.getValue() + EOL;
            }
            outputString += EOL;
        }

        outputString += ruleString;
        outputString += EOL;

        return outputString;
    }

    static String getFilename(int id, String name) {
        String fileRule = name.toLowerCase().replaceAll("[^a-z0-9.-]", "_");
        return ConfigConstants.getConfigFolder() + File.separator + PATH_RULES + "(" + id + ")_" + fileRule
                + ruleExtension;
    }

    public static String saveRule(int id, String name, DesignerBlockBean rootBlock) {
        String ruleString = makeRule(id, name, rootBlock);
        if (ruleString == null) {
            return null;
        }

        // First delete the existing file
        // Since we'll use the rule name as part of the filename
        // and this can change (id is constant) we need to perform
        // a wildcard delete!
        String fWildcard = "\\(" + id + "\\)_.*\\" + ruleExtension;
        final File folder = new File(PATH_RULES);
        final File[] allFiles = folder.listFiles();
        if (allFiles != null) {
            for (File file : allFiles) {
                if (!file.getName().matches(fWildcard)) {
                    continue;
                }
                if (!file.delete()) {
                    logger.error("Can't remove " + file.getAbsolutePath());
                }
            }
        }

        String fileName = getFilename(id, name);
        try {
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(fileName), "UTF-8"));

            out.write(ruleString);
            out.write(EOL);
            out.close();
        } catch (IOException e) {
            logger.error("Error writing habmin rule file :", e);
        }
        return ruleString;
    }

    public static String loadSource(int id, String name) {
        String source = null;

        FileInputStream inputStream = null;
        try {
            inputStream = new FileInputStream(getFilename(id, name));
            source = IOUtils.toString(inputStream);
        } catch (FileNotFoundException e) {
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        if (inputStream != null) {
            try {
                inputStream.close();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        return source;
    }

    private static HashMap<String, Class<? extends DesignerRuleCreator>> blockMap = null;

    public static DesignerRuleCreator getBlockProcessor(String type) {
        if (blockMap == null) {
            blockMap = new HashMap<String, Class<? extends DesignerRuleCreator>>();
            blockMap.put("controls_if", ControlIfBlock.class);
            blockMap.put("logic_operation", LogicOperationBlock.class);
            blockMap.put("logic_compare", LogicCompareBlock.class);
            blockMap.put("logic_boolean", LogicBooleanBlock.class);
            blockMap.put("logic_negate", LogicNegateBlock.class);
            blockMap.put("math_arithmetic", MathArithmeticBlock.class);
            blockMap.put("math_number", MathNumberBlock.class);
            blockMap.put("math_round", MathRoundBlock.class);
            blockMap.put("math_constrain", MathConstrainBlock.class);
            blockMap.put("variables_get", VariableGetBlock.class);
            blockMap.put("variables_set", VariableSetBlock.class);
            blockMap.put("openhab_constantget", OpenhabConstantGetBlock.class);
            blockMap.put("openhab_constantset", OpenhabConstantSetBlock.class);
            blockMap.put("openhab_itemget", OpenhabItemGetBlock.class);
            blockMap.put("openhab_itemset", OpenhabItemSetBlock.class);
            blockMap.put("openhab_itemcmd", OpenhabItemCmdBlock.class);
            blockMap.put("openhab_rule", OpenhabRuleBlock.class);
            blockMap.put("openhab_iftimer", OpenhabIfTimerBlock.class);
            blockMap.put("openhab_persistence_get", OpenhabPersistenceGetBlock.class);
            blockMap.put("openhab_state_onoff", OpenhabStateOnOffBlock.class);
            blockMap.put("openhab_state_openclosed", OpenhabStateOpenClosedBlock.class);
            blockMap.put("openhab_time", OpenhabTimeBlock.class);
            blockMap.put("text", TextBlock.class);
        }

        if (blockMap.get(type) == null) {
            return null;
        }

        Constructor<? extends DesignerRuleCreator> constructor;
        try {
            constructor = blockMap.get(type).getConstructor();
            return constructor.newInstance();
        } catch (NoSuchMethodException e) {
            logger.error("Command processor error: {}", e);
        } catch (InvocationTargetException e) {
            logger.error("Command processor error: {}", e);
        } catch (InstantiationException e) {
            logger.error("Command processor error: {}", e);
        } catch (IllegalAccessException e) {
            logger.error("Command processor error: {}", e);
        } catch (SecurityException e) {
            logger.error("Command processor error: {}", e);
        } catch (IllegalArgumentException e) {
            logger.error("Command processor error: {}", e);
        }

        return null;
    }
}
