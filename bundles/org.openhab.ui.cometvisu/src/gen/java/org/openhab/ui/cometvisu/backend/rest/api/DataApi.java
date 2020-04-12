package org.openhab.ui.cometvisu.backend.rest.api;

import org.openhab.ui.cometvisu.backend.rest.model.DataProviderResponse;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;


import java.io.InputStream;
import java.util.Map;
import java.util.List;


@Path("/data")
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-11T09:58:07.106+02:00[Europe/Berlin]")
public interface DataApi {

    @GET
    @Path("/addresses")
    @Produces({ "application/json" })
    DataProviderResponse getAddresses();

    @GET
    @Path("/designs")
    @Produces({ "application/json" })
    List<String> getDesigns();

    @GET
    @Path("/influxdbfields")
    @Produces({ "application/json" })
    DataProviderResponse getInfluxDBFields(@QueryParam("auth")   String auth,@QueryParam("measurement")   String measurement);

    @GET
    @Path("/influxdbtags")
    @Produces({ "application/json" })
    DataProviderResponse getInfluxDBTags(@QueryParam("auth")   String auth,@QueryParam("measurement")   String measurement);

    @GET
    @Path("/influxdbs")
    @Produces({ "application/json" })
    DataProviderResponse getInfluxDBs(@QueryParam("auth")   String auth);

    @GET
    @Path("/rrds")
    @Produces({ "application/json" })
    DataProviderResponse getRRDs();
}
