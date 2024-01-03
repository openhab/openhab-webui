/**
 * Copyright (c) 2010-2024 Contributors to the openHAB project
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
package org.openhab.ui.basic.internal.servlet;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.events.EventPublisher;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.items.events.ItemEventFactory;
import org.openhab.core.library.items.SwitchItem;
import org.openhab.core.library.types.OnOffType;
import org.openhab.core.types.Command;
import org.openhab.core.types.TypeParser;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardResource;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletAsyncSupported;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletName;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletPattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This servlet receives events from the web app and sends these as
 * commands to the bus.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Stefan Bußweiler - Migration to new ESH event concept
 *
 */
@Component(immediate = true, service = Servlet.class)
@HttpWhiteboardResource(pattern = "/basicui/*", prefix = "/web")
@HttpWhiteboardServletAsyncSupported(asyncSupported = true)
@HttpWhiteboardServletName(CmdServlet.SERVLET_PATH)
@HttpWhiteboardServletPattern(CmdServlet.SERVLET_PATH + "/*")
@NonNullByDefault
public class CmdServlet extends HttpServlet {

    private static final long serialVersionUID = 4813813926991230571L;

    public static final String SERVLET_PATH = "/basicui/CMD";

    private final Logger logger = LoggerFactory.getLogger(CmdServlet.class);

    private final EventPublisher eventPublisher;
    private final ItemRegistry itemRegistry;

    @Activate
    public CmdServlet(final @Reference ItemRegistry itemRegistry, final @Reference EventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
        this.itemRegistry = itemRegistry;
    }

    @Override
    protected void service(@NonNullByDefault({}) HttpServletRequest req, @NonNullByDefault({}) HttpServletResponse resp)
            throws ServletException, IOException {
        for (Object key : req.getParameterMap().keySet()) {
            String itemName = key.toString();

            if (!itemName.startsWith("__")) { // all additional webapp params start with "__" and should be ignored
                String commandName = req.getParameter(itemName);
                try {
                    Item item = itemRegistry.getItem(itemName);

                    // we need a special treatment for the "TOGGLE" command of switches;
                    // this is no command officially supported and must be translated
                    // into real commands by the webapp.
                    if ((item instanceof SwitchItem || item instanceof GroupItem) && "TOGGLE".equals(commandName)) {
                        commandName = OnOffType.ON.equals(item.getStateAs(OnOffType.class)) ? "OFF" : "ON";
                    }

                    Command command = commandName == null ? null
                            : TypeParser.parseCommand(item.getAcceptedCommandTypes(), commandName);
                    if (command != null) {
                        eventPublisher.post(ItemEventFactory.createCommandEvent(itemName, command));
                    } else {
                        logger.warn("Received unknown command '{}' for item '{}'", commandName, itemName);
                    }
                } catch (ItemNotFoundException e) {
                    logger.warn("Received command '{}' for item '{}', but the item does not exist in the registry",
                            commandName, itemName);
                }
            }
        }
    }
}
