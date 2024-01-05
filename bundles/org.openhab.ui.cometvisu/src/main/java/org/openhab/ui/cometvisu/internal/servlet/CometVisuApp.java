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
package org.openhab.ui.cometvisu.internal.servlet;

import java.util.ArrayList;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;

import org.openhab.core.config.core.ConfigurableService;
import org.openhab.core.events.EventPublisher;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.model.sitemap.SitemapProvider;
import org.openhab.core.persistence.PersistenceService;
import org.openhab.core.persistence.QueryablePersistenceService;
import org.openhab.core.ui.icon.IconProvider;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.util.ClientInstaller;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.osgi.service.cm.ConfigurationException;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * registers the CometVisuServlet-Service
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@Component(immediate = true, service = CometVisuApp.class, configurationPid = "org.openhab.cometvisu", //
        property = Constants.SERVICE_PID + "=org.openhab.cometvisu")
@ConfigurableService(category = "ui", label = "CometVisu", description_uri = CometVisuApp.CONFIG_URI)
public class CometVisuApp {

    private final Logger logger = LoggerFactory.getLogger(CometVisuApp.class);

    protected static final String CONFIG_URI = "ui:cometvisu";

    protected HttpService httpService;

    private ItemUIRegistry itemUIRegistry;

    private ItemRegistry itemRegistry;

    private Set<SitemapProvider> sitemapProviders = new HashSet<>();

    private List<IconProvider> iconProviders = new ArrayList<>();

    private EventPublisher eventPublisher;

    private CometVisuServlet servlet;

    protected static Map<String, QueryablePersistenceService> persistenceServices = new HashMap<>();

    private final ClientInstaller installer = ClientInstaller.getInstance();

    private Map<String, Object> properties = new HashMap<>();

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Object> props) {
        properties = props;
    }

    public CometVisuServlet getServlet() {
        return servlet;
    }

    @Reference
    protected void setEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    protected void unsetEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = null;
    }

    public EventPublisher getEventPublisher() {
        return this.eventPublisher;
    }

    @Reference(cardinality = ReferenceCardinality.MULTIPLE, policy = ReferencePolicy.DYNAMIC)
    public void addPersistenceService(PersistenceService service) {
        if (service instanceof QueryablePersistenceService) {
            persistenceServices.put(service.getId(), (QueryablePersistenceService) service);
        }
    }

    public void removePersistenceService(PersistenceService service) {
        persistenceServices.remove(service.getId());
    }

    public static Map<String, QueryablePersistenceService> getPersistenceServices() {
        return persistenceServices;
    }

    public List<IconProvider> getIconProviders() {
        return iconProviders;
    }

    @Reference(cardinality = ReferenceCardinality.AT_LEAST_ONE, policy = ReferencePolicy.DYNAMIC)
    public void addIconProvider(IconProvider iconProvider) {
        this.iconProviders.add(iconProvider);
    }

    public void removeIconProvider(IconProvider iconProvider) {
        this.iconProviders.remove(iconProvider);
    }

    @Reference
    protected void setItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = itemRegistry;
    }

    public ItemRegistry getItemRegistry() {
        return itemRegistry;
    }

    protected void unsetItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = null;
    }

    @Reference
    public void setItemUIRegistry(ItemUIRegistry itemUIRegistry) {
        this.itemUIRegistry = itemUIRegistry;
    }

    public void unsetItemUIRegistry(ItemUIRegistry itemUIRegistry) {
        this.itemUIRegistry = null;
    }

    @Reference(cardinality = ReferenceCardinality.MULTIPLE, policy = ReferencePolicy.DYNAMIC)
    public void addSitemapProvider(SitemapProvider provider) {
        sitemapProviders.add(provider);
    }

    public void removeSitemapProvider(SitemapProvider provider) {
        sitemapProviders.remove(provider);
    }

    public ItemUIRegistry getItemUIRegistry() {
        return itemUIRegistry;
    }

    public Set<SitemapProvider> getSitemapProviders() {
        return sitemapProviders;
    }

    @Reference
    protected void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    protected void unsetHttpService(HttpService httpService) {
        this.httpService = null;
    }

    private void readConfiguration(final Map<String, Object> properties) {
        if (properties != null) {
            setProperties(properties);
            if (properties.get(Config.COMETVISU_WEBFOLDER_PROPERTY) != null) {
                Config.setCometVisuFolder((String) properties.get(Config.COMETVISU_WEBFOLDER_PROPERTY));
            }
            if (properties.get(Config.COMETVISU_WEBAPP_ALIAS_PROPERTY) != null) {
                Config.cometvisuWebappAlias = (String) properties.get(Config.COMETVISU_WEBAPP_ALIAS_PROPERTY);
            }
            if (properties.get(Config.COMETVISU_AUTODOWNLOAD_PROPERTY) != null) {
                Object propertyValue = properties.get(Config.COMETVISU_AUTODOWNLOAD_PROPERTY);

                // Value might be a string or a boolean
                Boolean newValue = false;
                if (propertyValue instanceof String) {
                    newValue = Boolean.valueOf((String) propertyValue);
                } else if (propertyValue instanceof Boolean) {
                    newValue = (Boolean) propertyValue;
                }

                boolean changed = Config.cometvisuAutoDownload != newValue;
                Config.cometvisuAutoDownload = newValue;
                if (Config.cometvisuAutoDownload && changed) {
                    // let the installer check if the CometVisu client is installed and do that if not
                    installer.check();
                }
                Config.cometvisuAutoDownload = newValue;
            }
            ArrayList<String> changedKeys = new ArrayList<>();
            for (String key : properties.keySet()) {
                String[] parts = key.split(">");
                String propKey = parts.length > 1 ? parts[1] : parts[0];
                String propPid = parts.length > 1 ? parts[0] : "";

                logger.debug("Property: {}->{}:{}, Parts {}", propPid, propKey, properties.get(key), parts.length);
                if (!propPid.isEmpty()) {
                    if (Config.configMappings.containsKey(propPid)) {
                        Config.configMappings.get(propPid).put(propKey, properties.get(key));
                        if (!changedKeys.contains(propPid)) {
                            changedKeys.add(propPid);
                        }
                    }
                }
            }
            for (final String key : changedKeys) {
                Config.triggerConfigChange(key);
            }
        }
    }

    /**
     * Called by the SCR to activate the component with its configuration read
     * from CAS
     *
     * @param bundleContext
     *            BundleContext of the Bundle that defines this component
     * @param configuration
     *            Configuration properties for this component obtained from the
     *            ConfigAdmin service
     */
    @Activate
    protected void activate(Map<String, Object> configProps) throws ConfigurationException {
        readConfiguration(configProps);
        registerServlet();
        logger.info("Started CometVisu UI at {} serving {}", Config.cometvisuWebappAlias, Config.cometvisuWebfolder);
    }

    @Deactivate
    public void deactivate(BundleContext componentContext) {
        unregisterServlet();
        logger.info("Stopped CometVisu UI");
    }

    private void registerServlet() {
        // As the alias is user configurable, we have to check if it has a
        // trailing slash but no leading slash
        if (!Config.cometvisuWebappAlias.startsWith("/")) {
            Config.cometvisuWebappAlias = "/" + Config.cometvisuWebappAlias;
        }

        if (Config.cometvisuWebappAlias.endsWith("/")) {
            Config.cometvisuWebappAlias = Config.cometvisuWebappAlias.substring(0,
                    Config.cometvisuWebappAlias.length() - 1);
        }

        Dictionary<String, String> servletParams = new Hashtable<>();
        servlet = new CometVisuServlet(Config.cometvisuWebfolder, this);
        try {
            httpService.registerServlet(Config.cometvisuWebappAlias, servlet, servletParams, null);
        } catch (ServletException e) {
            logger.error("Error during servlet startup", e);
        } catch (NamespaceException e) {
            logger.error("Error during servlet startup", e);
        }
    }

    private void unregisterServlet() {
        httpService.unregister(Config.cometvisuWebappAlias);
    }

    /**
     * Called by the SCR when the configuration of a binding has been changed
     * through the ConfigAdmin service.
     *
     * @param configuration
     *            Updated configuration properties
     */
    @Modified
    protected void modified(Map<String, Object> configProps) throws ConfigurationException {
        logger.info("updated({})", configProps);
        if (configProps == null) {
            return;
        }
        if (configProps.containsKey(Config.COMETVISU_WEBFOLDER_PROPERTY)
                || configProps.containsKey(Config.COMETVISU_WEBAPP_ALIAS_PROPERTY)) {
            unregisterServlet();
        }
        readConfiguration(configProps);
        if (configProps.containsKey(Config.COMETVISU_WEBFOLDER_PROPERTY)
                || configProps.containsKey(Config.COMETVISU_WEBAPP_ALIAS_PROPERTY)) {
            registerServlet();
        }
    }
}
