package org.openhab.ui.cometvisu.backend.rest.api;

import java.math.BigDecimal;
import org.openhab.ui.cometvisu.backend.rest.model.CheckResponse;
import java.io.File;
import org.openhab.ui.cometvisu.backend.rest.model.ReadResponse;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;


import java.io.InputStream;
import java.util.Map;
import java.util.List;


@Path("/fs")
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-11T09:58:07.106+02:00[Europe/Berlin]")
public interface FsApi {

    @GET
    @Path("/check")
    @Produces({ "application/json" })
    CheckResponse checkEnvironment();

    @POST
    @Consumes({ "multipart/form-data", "text/_*" })
    void create(@QueryParam("path")   String path,@QueryParam("type")   String type,@QueryParam("hash")   BigDecimal hash, @FormParam(value = "file") InputStream fileInputStream,@FormParam(value = "filename")  String filename,@FormParam(value = "force")  Boolean force);

    @DELETE
    void delete(@QueryParam("path")   String path,@QueryParam("hash")   BigDecimal hash,@QueryParam("force")   Boolean force);

    @PUT
    @Path("/move")
    void move(@QueryParam("src")   String src,@QueryParam("target")   String target);

    @GET
    @Produces({ "application/json", "text/_*" })
    ReadResponse read(@QueryParam("path")   String path,@QueryParam("hash")   BigDecimal hash,@QueryParam("download")   Boolean download,@QueryParam("recursive")   Boolean recursive);

    @PUT
    @Consumes({ "text/_*" })
    void update(@QueryParam("path")   String path,String body,@QueryParam("hash")   BigDecimal hash);
}
