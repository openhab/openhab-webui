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

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.io.http.HttpContextFactoryService;
import org.openhab.core.io.http.servlet.OpenHABBundleServlet;
import org.openhab.core.items.ItemRegistry;
import org.osgi.service.http.HttpService;

/**
 * This is the base servlet class for other servlet in the Basic UI.
 *
 * @author Thomas.Eichstaedt-Engelen - Initial contribution
 */
@NonNullByDefault
public abstract class BaseServlet extends OpenHABBundleServlet {

    private static final long serialVersionUID = -4012800772403491132L;

    protected final ItemRegistry itemRegistry;

    /** the root path of this web application */
    public static final String WEBAPP_ALIAS = "/basicui";

    public BaseServlet(HttpService httpService, HttpContextFactoryService httpContextFactoryService,
            ItemRegistry itemRegistry) {
        super(httpService, httpContextFactoryService);
        this.itemRegistry = itemRegistry;
    }
}
