package org.openhab.ui.cometvisu.backend.rest.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaJAXRSSpecServerCodegen", date = "2020-04-14T16:34:36.480+02:00[Europe/Berlin]")
public class FsEntry   {
  
  private  String name;

public enum TypeEnum {

    DIR(String.valueOf("DIR")), FILE(String.valueOf("FILE"));


    private String value;

    TypeEnum (String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static TypeEnum fromValue(String value) {
        for (TypeEnum b : TypeEnum.values()) {
            if (b.value.equals(value)) {
                return b;
            }
        }
        throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
}

  private  TypeEnum type;
  private  String parentFolder;
  private  Boolean hasChildren;
  private  List<FsEntry> children = new ArrayList<>();
  private  Boolean readable = false;
  private  Boolean writeable = false;
  private  Boolean mounted = false;
  private  Boolean trash = false;
  private  Boolean inTrash = false;
  private  BigDecimal hash;

  /**
   **/
  public FsEntry name(String name) {
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
  public FsEntry type(TypeEnum type) {
    this.type = type;
    return this;
  }

  
  @JsonProperty("type")
  public TypeEnum getType() {
    return type;
  }
  public void setType(TypeEnum type) {
    this.type = type;
  }

  /**
   **/
  public FsEntry parentFolder(String parentFolder) {
    this.parentFolder = parentFolder;
    return this;
  }

  
  @JsonProperty("parentFolder")
  public String getParentFolder() {
    return parentFolder;
  }
  public void setParentFolder(String parentFolder) {
    this.parentFolder = parentFolder;
  }

  /**
   **/
  public FsEntry hasChildren(Boolean hasChildren) {
    this.hasChildren = hasChildren;
    return this;
  }

  
  @JsonProperty("hasChildren")
  public Boolean getHasChildren() {
    return hasChildren;
  }
  public void setHasChildren(Boolean hasChildren) {
    this.hasChildren = hasChildren;
  }

  /**
   **/
  public FsEntry children(List<FsEntry> children) {
    this.children = children;
    return this;
  }

  
  @JsonProperty("children")
  public List<FsEntry> getChildren() {
    return children;
  }
  public void setChildren(List<FsEntry> children) {
    this.children = children;
  }

  /**
   **/
  public FsEntry readable(Boolean readable) {
    this.readable = readable;
    return this;
  }

  
  @JsonProperty("readable")
  public Boolean getReadable() {
    return readable;
  }
  public void setReadable(Boolean readable) {
    this.readable = readable;
  }

  /**
   **/
  public FsEntry writeable(Boolean writeable) {
    this.writeable = writeable;
    return this;
  }

  
  @JsonProperty("writeable")
  public Boolean getWriteable() {
    return writeable;
  }
  public void setWriteable(Boolean writeable) {
    this.writeable = writeable;
  }

  /**
   * true when this file/folder is inside a mounted folder
   **/
  public FsEntry mounted(Boolean mounted) {
    this.mounted = mounted;
    return this;
  }

  
  @JsonProperty("mounted")
  public Boolean getMounted() {
    return mounted;
  }
  public void setMounted(Boolean mounted) {
    this.mounted = mounted;
  }

  /**
   * marks the trash folder
   **/
  public FsEntry trash(Boolean trash) {
    this.trash = trash;
    return this;
  }

  
  @JsonProperty("trash")
  public Boolean getTrash() {
    return trash;
  }
  public void setTrash(Boolean trash) {
    this.trash = trash;
  }

  /**
   * true when this entry is inside the trash folder
   **/
  public FsEntry inTrash(Boolean inTrash) {
    this.inTrash = inTrash;
    return this;
  }

  
  @JsonProperty("inTrash")
  public Boolean getInTrash() {
    return inTrash;
  }
  public void setInTrash(Boolean inTrash) {
    this.inTrash = inTrash;
  }

  /**
   * hash value for file content (CRC32)
   **/
  public FsEntry hash(BigDecimal hash) {
    this.hash = hash;
    return this;
  }

  
  @JsonProperty("hash")
  public BigDecimal getHash() {
    return hash;
  }
  public void setHash(BigDecimal hash) {
    this.hash = hash;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    FsEntry fsEntry = (FsEntry) o;
    return Objects.equals(this.name, fsEntry.name) &&
        Objects.equals(this.type, fsEntry.type) &&
        Objects.equals(this.parentFolder, fsEntry.parentFolder) &&
        Objects.equals(this.hasChildren, fsEntry.hasChildren) &&
        Objects.equals(this.children, fsEntry.children) &&
        Objects.equals(this.readable, fsEntry.readable) &&
        Objects.equals(this.writeable, fsEntry.writeable) &&
        Objects.equals(this.mounted, fsEntry.mounted) &&
        Objects.equals(this.trash, fsEntry.trash) &&
        Objects.equals(this.inTrash, fsEntry.inTrash) &&
        Objects.equals(this.hash, fsEntry.hash);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, type, parentFolder, hasChildren, children, readable, writeable, mounted, trash, inTrash, hash);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class FsEntry {\n");
    
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    type: ").append(toIndentedString(type)).append("\n");
    sb.append("    parentFolder: ").append(toIndentedString(parentFolder)).append("\n");
    sb.append("    hasChildren: ").append(toIndentedString(hasChildren)).append("\n");
    sb.append("    children: ").append(toIndentedString(children)).append("\n");
    sb.append("    readable: ").append(toIndentedString(readable)).append("\n");
    sb.append("    writeable: ").append(toIndentedString(writeable)).append("\n");
    sb.append("    mounted: ").append(toIndentedString(mounted)).append("\n");
    sb.append("    trash: ").append(toIndentedString(trash)).append("\n");
    sb.append("    inTrash: ").append(toIndentedString(inTrash)).append("\n");
    sb.append("    hash: ").append(toIndentedString(hash)).append("\n");
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

