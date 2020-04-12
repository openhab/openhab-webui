package org.openhab.ui.cometvisu.backend.rest.model;

import java.util.ArrayList;
import java.util.List;
import org.openhab.ui.cometvisu.backend.rest.model.ConfigOption;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-11T14:15:37.661+02:00[Europe/Berlin]")
public class ConfigSection   {
  
  private  String name;
  private  List<ConfigOption> options = new ArrayList<>();

  /**
   **/
  public ConfigSection name(String name) {
    this.name = name;
    return this;
  }

  
  @JsonProperty("name")
  public String getName() {
    return name;
  }
  public void setName(String name) {
    this.name = name;
  }

  /**
   **/
  public ConfigSection options(List<ConfigOption> options) {
    this.options = options;
    return this;
  }

  
  @JsonProperty("options")
  public List<ConfigOption> getOptions() {
    return options;
  }
  public void setOptions(List<ConfigOption> options) {
    this.options = options;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ConfigSection configSection = (ConfigSection) o;
    return Objects.equals(this.name, configSection.name) &&
        Objects.equals(this.options, configSection.options);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, options);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ConfigSection {\n");
    
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    options: ").append(toIndentedString(options)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

