package org.openhab.ui.cometvisu.backend.rest.api;

import org.openhab.ui.cometvisu.backend.rest.model.ConfigSection;
import java.util.List;
import org.openhab.ui.cometvisu.backend.rest.model.OneOfHiddenConfigConfigSectionConfigOption;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;


import java.io.InputStream;
import java.util.Map;
import java.util.List;


@Path("/config")
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-11T09:58:07.106+02:00[Europe/Berlin]")
public interface ConfigApi {

    @POST
    @Path("/hidden/{section}/{key}")
    @Consumes({ "text/plain" })
    void createHiddenConfig(@PathParam("section") String section,@PathParam("key") String key,String body);

    @DELETE
    @Path("/hidden/{section}/{key}")
    void deleteHiddenConfig(@PathParam("section") String section,@PathParam("key") String key);

    @GET
    @Path("/hidden/{section}/{key}")
    @Produces({ "application/json" })
    OneOfHiddenConfigConfigSectionConfigOption getHiddenConfig(@PathParam("section") String section,@PathParam("key") String key);

    @PUT
    @Path("/hidden")
    @Consumes({ "application/json" })
    void saveHiddenConfig(List<ConfigSection> configSection);

    @PUT
    @Path("/hidden/{section}/{key}")
    @Consumes({ "text/plain" })
    void updateHiddenConfig(@PathParam("section") String section,@PathParam("key") String key,String body);
}
