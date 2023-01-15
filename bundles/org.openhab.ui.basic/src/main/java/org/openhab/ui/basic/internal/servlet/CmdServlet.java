/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.events.EventPublisher;
import org.openhab.core.io.http.HttpContextFactoryService;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.items.events.ItemEventFactory;
import org.openhab.core.library.items.SwitchItem;
import org.openhab.core.library.types.OnOffType;
import org.openhab.core.types.Command;
import org.openhab.core.types.TypeParser;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpService;

/**
 * This servlet receives events from the web app and sends these as
 * commands to the bus.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Stefan Bußweiler - Migration to new ESH event concept
 *
 */
@Component(immediate = true, service = {})
@NonNullByDefault
public class CmdServlet extends BaseServlet {

    private static final long serialVersionUID = 4813813926991230571L;

    public static final String SERVLET_NAME = "CMD";

    private final EventPublisher eventPublisher;
    private final ImplicitUserRoleSecurityHandler securityHandler;

    @Activate
    public CmdServlet(final @Reference HttpService httpService,
            final @Reference HttpContextFactoryService httpContextFactoryService,
            final @Reference ItemRegistry itemRegistry, final @Reference EventPublisher eventPublisher,
            final @Reference ImplicitUserRoleSecurityHandler securityHandler) {
        super(httpService, httpContextFactoryService, itemRegistry);
        this.eventPublisher = eventPublisher;
        this.securityHandler = securityHandler;
    }

    @Activate
    protected void activate(BundleContext bundleContext) {
        securityHandler.addUriToChecks(WEBAPP_ALIAS);
        super.activate(WEBAPP_ALIAS + "/" + SERVLET_NAME, bundleContext);
    }

    @Deactivate
    protected void deactivate() {
        securityHandler.removeUriFromChecks(WEBAPP_ALIAS);
        httpService.unregister(WEBAPP_ALIAS + "/" + SERVLET_NAME);
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
