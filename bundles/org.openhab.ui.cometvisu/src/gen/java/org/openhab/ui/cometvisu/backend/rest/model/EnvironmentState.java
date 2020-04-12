package org.openhab.ui.cometvisu.backend.rest.model;

import java.math.BigDecimal;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-11T14:15:37.661+02:00[Europe/Berlin]")
public class EnvironmentState   {
  
  private  String entity;
  private  BigDecimal state;

  /**
   **/
  public EnvironmentState entity(String entity) {
    this.entity = entity;
    return this;
  }

  
  @JsonProperty("entity")
  public String getEntity() {
    return entity;
  }
  public void setEntity(String entity) {
    this.entity = entity;
  }

  /**
   * bitmask with a list of states &lt;writeable,readable,exists&gt;
   **/
  public EnvironmentState state(BigDecimal state) {
    this.state = state;
    return this;
  }

  
  @JsonProperty("state")
  public BigDecimal getState() {
    return state;
  }
  public void setState(BigDecimal state) {
    this.state = state;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    EnvironmentState environmentState = (EnvironmentState) o;
    return Objects.equals(this.entity, environmentState.entity) &&
        Objects.equals(this.state, environmentState.state);
  }

  @Override
  public int hashCode() {
    return Objects.hash(entity, state);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class EnvironmentState {\n");
    
    sb.append("    entity: ").append(toIndentedString(entity)).append("\n");
    sb.append("    state: ").append(toIndentedString(state)).append("\n");
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

