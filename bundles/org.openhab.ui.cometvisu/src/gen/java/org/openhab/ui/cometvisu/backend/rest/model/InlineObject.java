package org.openhab.ui.cometvisu.backend.rest.model;

import java.io.File;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


public class InlineObject   {
  
  private  File file;
  private  String filename;
  private  Boolean force;

  /**
   **/
  public InlineObject file(File file) {
    this.file = file;
    return this;
  }

  
  @JsonProperty("file")
  public File getFile() {
    return file;
  }
  public void setFile(File file) {
    this.file = file;
  }

  /**
   * filename to use (if it should be another one than the original filename)
   **/
  public InlineObject filename(String filename) {
    this.filename = filename;
    return this;
  }

  
  @JsonProperty("filename")
  public String getFilename() {
    return filename;
  }
  public void setFilename(String filename) {
    this.filename = filename;
  }

  /**
   * replace existing file
   **/
  public InlineObject force(Boolean force) {
    this.force = force;
    return this;
  }

  
  @JsonProperty("force")
  public Boolean getForce() {
    return force;
  }
  public void setForce(Boolean force) {
    this.force = force;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    InlineObject inlineObject = (InlineObject) o;
    return Objects.equals(this.file, inlineObject.file) &&
        Objects.equals(this.filename, inlineObject.filename) &&
        Objects.equals(this.force, inlineObject.force);
  }

  @Override
  public int hashCode() {
    return Objects.hash(file, filename, force);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class InlineObject {\n");
    
    sb.append("    file: ").append(toIndentedString(file)).append("\n");
    sb.append("    filename: ").append(toIndentedString(filename)).append("\n");
    sb.append("    force: ").append(toIndentedString(force)).append("\n");
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

