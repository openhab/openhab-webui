package org.openhab.ui.cometvisu.backend.rest.model;

import java.util.ArrayList;
import java.util.List;
import org.openhab.ui.cometvisu.backend.rest.model.DataProviderHint;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-14T16:34:36.480+02:00[Europe/Berlin]")
public class DataProviderEntry   {
  
  private  String value;
  private  String label;
  private  List<DataProviderHint> hints = new ArrayList<>();

  /**
   **/
  public DataProviderEntry value(String value) {
    this.value = value;
    return this;
  }

  
  @JsonProperty("value")
  public String getValue() {
    return value;
  }
  public void setValue(String value) {
    this.value = value;
  }

  /**
   **/
  public DataProviderEntry label(String label) {
    this.label = label;
    return this;
  }

  
  @JsonProperty("label")
  public String getLabel() {
    return label;
  }
  public void setLabel(String label) {
    this.label = label;
  }

  /**
   **/
  public DataProviderEntry hints(List<DataProviderHint> hints) {
    this.hints = hints;
    return this;
  }

  
  @JsonProperty("hints")
  public List<DataProviderHint> getHints() {
    return hints;
  }
  public void setHints(List<DataProviderHint> hints) {
    this.hints = hints;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DataProviderEntry dataProviderEntry = (DataProviderEntry) o;
    return Objects.equals(this.value, dataProviderEntry.value) &&
        Objects.equals(this.label, dataProviderEntry.label) &&
        Objects.equals(this.hints, dataProviderEntry.hints);
  }

  @Override
  public int hashCode() {
    return Objects.hash(value, label, hints);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class DataProviderEntry {\n");
    
    sb.append("    value: ").append(toIndentedString(value)).append("\n");
    sb.append("    label: ").append(toIndentedString(label)).append("\n");
    sb.append("    hints: ").append(toIndentedString(hints)).append("\n");
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

